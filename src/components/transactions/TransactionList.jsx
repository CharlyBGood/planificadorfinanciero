import { useGlobalState } from "../../contexts/GlobalState"
import { TransactionItem } from "./TransactionItem"

export function TransactionList() {
  const { transactions, loading, error } = useGlobalState()

  if (loading) {
    return (
      <div className="bg-zinc-900 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Historial de Transacciones</h3>
        <div className="py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-zinc-900 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Historial de Transacciones</h3>
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-center">Historial de Transacciones</h3>

      {transactions.length === 0 ? (
        <div className="py-8 flex items-center justify-center w-full flex-col">
          <h1 className="text-lg font-medium text-neutral-400">Aún no hay transacciones</h1>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}
    </div>
  )
}