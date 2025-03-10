"use client"

import { useGlobalState } from "../../contexts/GlobalState"
import { BiTrash } from "react-icons/bi"

export function TransactionItem({ transaction: { id, description, amount } }) {
  const { deleteTransaction } = useGlobalState()
  const sign = amount < 0 ? "-" : "+"
  const isExpense = amount < 0

  return (
    <li
      className={`px-4 py-3 rounded-lg w-full flex justify-between items-center ${
        isExpense ? "bg-red-500/90" : "bg-green-500/90"
      }`}
    >
      <span className="font-medium text-black truncate max-w-[60%]">{description}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-black">
          {sign}${Math.abs(amount).toFixed(2)}
        </span>
        <button
          className="p-2 hover:bg-black/20 rounded-full transition-colors"
          onClick={() => deleteTransaction(id)}
          aria-label="Delete transaction"
        >
          <BiTrash className="text-xl" />
        </button>
      </div>
    </li>
  )
}

