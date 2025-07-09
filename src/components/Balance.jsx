import { useGlobalState } from "../contexts/GlobalState"

export function Balance({ categoryId }) {
  const { transactions } = useGlobalState()

  // Filter transactions by category if categoryId is provided
  const filteredTransactions = categoryId ? transactions.filter((t) => t.category_id === categoryId) : transactions

  const amounts = filteredTransactions.map((transaction) => transaction.amount)
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2)

  return (
    <div className="flex justify-between items-center my-4 p-3 bg-app-secondary rounded border-t-2 border-indigo-500">
      <h4 className="text-xl font-medium text-app-secondary">Tu Balance</h4>
      <h1 className="text-2xl md:text-3xl font-bold text-app">${total}</h1>
    </div>
  )
}

