"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"
import { CategoryCard } from "./CategoryCard"
import { CreateCategoryModal } from "./CreateCategoryModal"
import { PlusCircle } from "lucide-react"

export function Dashboard({ onCategorySelect }) {
  const { currentUser } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setCategories(data || [])
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Error al cargar las categorías")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()

    // Set up real-time subscription for categories
    const channel = supabase
      .channel("public:categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          fetchCategories()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  const handleCreateCategory = async (categoryData) => {
    try {
      const { error } = await supabase.from("categories").insert([
        {
          name: categoryData.name,
          description: categoryData.description,
          target_amount: categoryData.targetAmount || null,
          color: categoryData.color || "#6366F1", // Default to indigo
          user_id: currentUser.id,
        },
      ])

      if (error) throw error

      setIsCreateModalOpen(false)
    } catch (err) {
      console.error("Error creating category:", err)
      setError("Error al crear la categoría")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Mis Objetivos Financieros</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} />
          <span>Nuevo Objetivo</span>
        </button>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

      {categories.length === 0 ? (
        <div className="bg-neutral-700 rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-4">No tienes objetivos financieros</h3>
          <p className="text-neutral-400 mb-6">Crea tu primer objetivo para comenzar a gestionar tus finanzas</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <PlusCircle size={20} />
            <span>Crear Objetivo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onClick={() => onCategorySelect(category)} />
          ))}
        </div>
      )}

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCategory}
      />
    </div>
  )
}

