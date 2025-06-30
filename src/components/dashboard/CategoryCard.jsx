"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../supabase/config"
import { ArrowRight, Trash2 } from "lucide-react"

export function CategoryCard({ category, onClick, onDelete }) {
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const { data, error } = await supabase.from("transactions").select("*").eq("category_id", category.id)
        if (error) throw error
        const transactions = data || []
        const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
        const expense = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
        setStats({
          balance: income + expense,
          income,
          expense: Math.abs(expense),
          transactionCount: transactions.length,
        })
      } catch (err) {
        console.error("Error fetching category stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategoryStats()
  }, [category.id])

  const progressPercentage = category.target_amount
    ? Math.min(100, Math.max(0, (stats.balance / category.target_amount) * 100))
    : null

  // Eliminar categoría con confirmación
  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm(`¿Seguro que deseas eliminar el objetivo "${category.name}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    if (onDelete) {
      await onDelete(category.id)
    } else {
      // Default delete logic if not provided
      await supabase.from("categories").delete().eq("id", category.id)
    }
    setDeleting(false)
  }

  return (
    <div
      className="bg-neutral-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-400"
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${category.name}`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{ borderTop: `4px solid ${category.color || "#6366F1"}` }}
    >
      <div className="p-3 sm:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2 gap-2">
          <h3 className="text-lg sm:text-xl font-bold break-words" style={{ color: category.color || "#6366F1" }}>
            {category.name}
          </h3>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-red-100/20 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            aria-label={`Eliminar objetivo ${category.name}`}
            onClick={handleDelete}
            disabled={deleting}
            tabIndex={0}
          >
            <Trash2 className="text-red-500 w-5 h-5" />
          </button>
        </div>
        {category.description && <p className="text-neutral-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{category.description}</p>}
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-neutral-600 rounded animate-pulse"></div>
            <div className="h-4 bg-neutral-600 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-neutral-400">Balance:</span>
              <span className={`font-bold ${stats.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${stats.balance.toFixed(2)}
              </span>
            </div>
            {category.target_amount && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progreso</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-600 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>${stats.balance.toFixed(2)}</span>
                  <span>Meta: ${category.target_amount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-neutral-800 p-2 sm:p-3 flex flex-col sm:flex-row justify-between items-center border-t border-neutral-600 gap-1 sm:gap-0">
        <span className="text-xs sm:text-sm text-neutral-400">{stats.transactionCount} transacciones</span>
        <span className="text-indigo-400 flex items-center gap-1 text-xs sm:text-sm font-medium">
          Ver detalles <ArrowRight size={16} />
        </span>
      </div>
    </div>
  )
}

