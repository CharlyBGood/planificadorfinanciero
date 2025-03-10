"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../supabase/config"
import { ArrowRight } from "lucide-react"

export function CategoryCard({ category, onClick }) {
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const { data, error } = await supabase.from("transactions").select("*").eq("category_id", category.id)

        if (error) throw error

        // Calculate stats
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

  // Calculate progress percentage if target amount exists
  const progressPercentage = category.target_amount
    ? Math.min(100, Math.max(0, (stats.balance / category.target_amount) * 100))
    : null

  return (
    <div
      className="bg-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
      onClick={onClick}
      style={{ borderTop: `4px solid ${category.color || "#6366F1"}` }}
    >
      <div className="p-5">
        <h3 className="text-xl font-bold mb-1">{category.name}</h3>
        {category.description && <p className="text-neutral-300 text-sm mb-4 line-clamp-2">{category.description}</p>}

        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-neutral-600 rounded animate-pulse"></div>
            <div className="h-4 bg-neutral-600 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
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

      <div className="bg-neutral-800 p-3 flex justify-between items-center">
        <span className="text-sm text-neutral-400">{stats.transactionCount} transacciones</span>
        <span className="text-indigo-400 flex items-center gap-1 text-sm">
          Ver detalles <ArrowRight size={16} />
        </span>
      </div>
    </div>
  )
}

