import { useGlobalState } from "../contexts/GlobalState"

export function Balance() {
  const { transactions } = useGlobalState()

  const amounts = transactions.map((transaction) => transaction.amount)
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2)

  return (
    <div className="flex justify-between items-center my-4 p-3 bg-neutral-800 rounded border-t-2 border-indigo-500">
      <h4 className="text-xl font-medium text-slate-300">Tu Balance</h4>
      <h1 className="text-2xl md:text-3xl font-bold">${total}</h1>
    </div>
  )
}

