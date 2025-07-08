"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { Balance } from "../Balance"
import { TransactionForm } from "../transactions/TransactionForm"
import { TransactionList } from "../transactions/TransactionList"
import { IncomeExpenses } from "../IncomeExpenses"
import { ExpenseChart } from "../ExpenseChart"
import { EditCategoryModal } from "./EditCategoryModal"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"
import { useParams, useNavigate } from "react-router-dom"

export function CategoryView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  useEffect(() => {
    if (!id || !currentUser) return
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*").eq("id", id).eq("user_id", currentUser.id).single()
        if (error) throw error
        setCurrentCategory(data)
      } catch (err) {
        setCurrentCategory(null)
      }
    }
    fetchCategory()
    // Set up real-time subscription for this category
    const channel = supabase
      .channel(`public:categories:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "categories",
          filter: `id=eq.${id}`,
        },
        () => {
          fetchCategory()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, currentUser])

  if (!currentCategory) {
    return <div className="p-8 text-center text-neutral-400">Cargando objetivo...</div>
  }

  const handleUpdateCategory = async (updatedData) => {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: updatedData.name,
          description: updatedData.description,
          target_amount: updatedData.targetAmount || null,
          color: updatedData.color,
        })
        .eq("id", currentCategory.id)
        .eq("user_id", currentUser.id)

      if (error) throw error

      setIsEditModalOpen(false)
    } catch (err) {
      console.error("Error updating category:", err)
    }
  }

  const handleDeleteCategory = async () => {
    if (!window.confirm(`¿Seguro que deseas eliminar el objetivo "${currentCategory.name}"? Esta acción no se puede deshacer.`)) return
    await supabase.from("categories").delete().eq("id", currentCategory.id).eq("user_id", currentUser.id)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div
        className="p-2 sm:p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b"
        style={{ borderBottom: `2px solid ${currentCategory.color || "#6366F1"}` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-indigo-600 text-neutral-200 hover:text-white font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm sm:text-base"
          aria-label="Volver al Dashboard"
        >
          <ArrowLeft size={18} />
          <span className="sr-only">Volver al Dashboard</span>
          <span className="hidden sm:inline">Volver</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-indigo-600 text-neutral-200 hover:text-white font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm sm:text-base"
            aria-label="Editar objetivo"
            title="Editar objetivo"
          >
            <Pencil size={18} />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={handleDeleteCategory}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-red-600 text-neutral-200 hover:text-white font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all text-sm sm:text-base"
            aria-label="Eliminar objetivo"
            title="Eliminar objetivo"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>

      <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 break-words">{currentCategory.name}</h2>
          {currentCategory.description && <p className="text-neutral-400 mt-1 text-sm sm:text-base">{currentCategory.description}</p>}

          {currentCategory.target_amount && (
            <div className="mt-4 bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
                <span className="text-sm sm:text-base">Progreso hacia la meta</span>
                <span className="font-semibold text-indigo-300">${currentCategory.target_amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-neutral-700 rounded-full h-2.5 mb-1">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, 50))}%`,
                    backgroundColor: currentCategory.color || "#6366F1",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Main content - mobile first, responsive grid */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-1/2 space-y-4 lg:space-y-6">
            <div className="bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-sm">
              <IncomeExpenses categoryId={currentCategory.id} />
              <Balance categoryId={currentCategory.id} />
            </div>
            <div className="bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold mb-3 sm:mb-4">Nueva Transacción</h3>
              <TransactionForm categoryId={currentCategory.id} />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-4 lg:space-y-6">
            <div className="bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold mb-2 text-center">Distribución</h3>
              <ExpenseChart categoryId={currentCategory.id} />
            </div>
            <div className="bg-neutral-800 p-3 sm:p-4 rounded-xl shadow-sm">
              <TransactionList categoryId={currentCategory.id} />
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditCategoryModal
          category={currentCategory}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateCategory}
        />
      )}
    </div>
  )
}

