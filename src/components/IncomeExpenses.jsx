import { useGlobalState } from "../contexts/GlobalState"

export function IncomeExpenses() {
  const { transactions } = useGlobalState()

  const amounts = transactions.map((transaction) => transaction.amount)

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2)

  const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2)

  return (
    <>
      <div className="flex justify-between items-center my-3 p-2 bg-neutral-800 rounded">
        <h4 className="text-lg font-medium text-green-400">Ingreso</h4>
        <p className="text-xl font-bold">${income}</p>
      </div>
      <div className="flex justify-between items-center my-3 p-2 bg-neutral-800 rounded">
        <h4 className="text-lg font-medium text-red-400">Gasto</h4>
        <p className="text-xl font-bold">${expense}</p>
      </div>
    </>
  )
}

