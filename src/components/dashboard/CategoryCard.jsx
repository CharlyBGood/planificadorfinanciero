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
      className="bg-[var(--color-bg-secondary)] rounded-lg p-4 shadow-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors relative flex flex-col gap-2"
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Ver objetivo ${category.name}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick && onClick(e); }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-[var(--color-text)] break-words" style={{ color: category.color || undefined }}>{category.name}</h3>
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-400"></div>
        ) : (
          <span className="text-xs text-[var(--color-text-secondary)]">{stats.transactionCount} transacciones</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {loading ? (
          <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2 animate-pulse mb-1"></div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">+${stats.income.toFixed(2)}</span>
              <span className="text-red-600 dark:text-red-400">-${stats.expense.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Balance:</span>
              <span className={stats.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{stats.balance >= 0 ? "+" : "-"}${Math.abs(stats.balance).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
      {category.target_amount && !loading && (
        <div className="mt-2">
          <div className="w-full bg-neutral-300 dark:bg-neutral-700 rounded-full h-2.5 mb-1">
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: category.color || "#6366F1",
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Meta: ${category.target_amount.toFixed(2)}</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
        </div>
      )}
      <div className="bg-[var(--color-bg)] p-2 sm:p-3 flex flex-col sm:flex-row justify-between items-center border-t border-[var(--color-border)] gap-1 sm:gap-0">
        <span className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{stats.transactionCount} transacciones</span>
        <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-xs sm:text-sm font-medium">
          Ver detalles <ArrowRight size={16} />
        </span>
      </div>
    </div>
  )
}

