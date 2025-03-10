"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Pencil } from "lucide-react"
import { Balance } from "../Balance"
import { TransactionForm } from "../transactions/TransactionForm"
import { TransactionList } from "../transactions/TransactionList"
import { IncomeExpenses } from "../IncomeExpenses"
import { ExpenseChart } from "../ExpenseChart"
import { EditCategoryModal } from "./EditCategoryModal"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"

export function CategoryView({ category, onBack }) {
  const { currentUser } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(category)

  // Refresh category data when needed
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*").eq("id", category.id).single()

        if (error) throw error

        if (data) {
          setCurrentCategory(data)
        }
      } catch (err) {
        console.error("Error fetching category:", err)
      }
    }

    fetchCategory()

    // Set up real-time subscription for this category
    const channel = supabase
      .channel(`public:categories:${category.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "categories",
          filter: `id=eq.${category.id}`,
        },
        () => {
          fetchCategory()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [category.id])

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
        .eq("id", category.id)
        .eq("user_id", currentUser.id)

      if (error) throw error

      setIsEditModalOpen(false)
    } catch (err) {
      console.error("Error updating category:", err)
    }
  }

  return (
    <div>
      <div
        className="p-4 flex justify-between items-center"
        style={{ borderBottom: `2px solid ${currentCategory.color || "#6366F1"}` }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors"
        >
          <Pencil size={16} />
          <span>Editar</span>
        </button>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
          {currentCategory.description && <p className="text-neutral-400 mt-1">{currentCategory.description}</p>}

          {currentCategory.target_amount && (
            <div className="mt-4 bg-neutral-700 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Progreso hacia la meta</span>
                <span>${currentCategory.target_amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-neutral-600 rounded-full h-2.5 mb-1">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, 50))}%`,
                    backgroundColor: currentCategory.color || "#6366F1",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Main content - similar to the original app layout but filtered by category */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-neutral-700 p-4 rounded-lg">
              <IncomeExpenses categoryId={currentCategory.id} />
              <Balance categoryId={currentCategory.id} />
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Nueva Transacción</h3>
              <TransactionForm categoryId={currentCategory.id} />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-6">
            <div className="bg-neutral-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-center">Distribución</h3>
              <ExpenseChart categoryId={currentCategory.id} />
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
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

