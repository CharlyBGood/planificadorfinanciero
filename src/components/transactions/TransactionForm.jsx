"use client"

import { useState } from "react"
import { useGlobalState } from "../../contexts/GlobalState"

export function TransactionForm({ categoryId }) {
  const { addTransaction } = useGlobalState()

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [isIncome, setIsIncome] = useState(false)
  const [isExpense, setIsExpense] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!description || !amount || (!isIncome && !isExpense)) {
      return
    }

    setSubmitting(true)

    let finalAmount = Number.parseFloat(amount)
    if (isExpense) {
      finalAmount = -Math.abs(finalAmount)
    } else if (isIncome) {
      finalAmount = Math.abs(finalAmount)
    }

    addTransaction({
      description,
      amount: finalAmount,
      category_id: categoryId,
    })

    setDescription("")
    setAmount("")
    setIsIncome(false)
    setIsExpense(false)
    setSubmitting(false)
  }

  return (
    <div>
      <form onSubmit={onSubmit} aria-label="Formulario de nueva transacción">
        <fieldset className="flex items-center justify-between mb-4 gap-2" aria-label="Tipo de transacción">
          <legend className="sr-only">Tipo de transacción</legend>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="ingreso"
              className="w-5 h-5 cursor-pointer accent-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none"
              id="Ingreso"
              checked={isIncome}
              aria-checked={isIncome}
              onChange={(e) => {
                setIsIncome(e.target.checked)
                if (e.target.checked) setIsExpense(false)
              }}
            />
            <label htmlFor="Ingreso" className="text-lg cursor-pointer select-none">
              Ingreso
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5 cursor-pointer accent-red-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
              name="egreso"
              id="Egreso"
              checked={isExpense}
              aria-checked={isExpense}
              onChange={(e) => {
                setIsExpense(e.target.checked)
                if (e.target.checked) setIsIncome(false)
              }}
            />
            <label htmlFor="Egreso" className="text-lg cursor-pointer select-none">
              Egreso
            </label>
          </div>
        </fieldset>
        <div className="mb-3">
          <label htmlFor="amount" className="block text-sm font-medium mb-1">
            Monto
          </label>
          <input
            id="amount"
            className="bg-zinc-600 text-white px-4 py-3 rounded-lg block w-full text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            type="number"
            step="0.01"
            placeholder="Ej: 0.00"
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
            required
            aria-required="true"
            min="0"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <input
            id="description"
            type="text"
            placeholder="Descripción"
            onChange={(e) => setDescription(e.target.value)}
            className="bg-zinc-600 text-white px-4 py-3 rounded-lg block w-full text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={description}
            required
            aria-required="true"
            maxLength={100}
          />
        </div>
        <button
          className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg block w-full text-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={!description || !amount || (!isIncome && !isExpense) || submitting}
          type="submit"
          aria-disabled={!description || !amount || (!isIncome && !isExpense) || submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
              Agregando...
            </span>
          ) : (
            "Agregar"
          )}
        </button>
      </form>
    </div>
  )
}

