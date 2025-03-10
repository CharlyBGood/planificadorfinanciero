import { VictoryPie, VictoryLabel } from "victory"
import { useGlobalState } from "../contexts/GlobalState"
import { BsPieChartFill } from "react-icons/bs"

export function ExpenseChart({ categoryId }) {
  const { transactions } = useGlobalState()

  // Filter transactions by category if categoryId is provided
  const filteredTransactions = categoryId ? transactions.filter((t) => t.category_id === categoryId) : transactions

  const totalIncomes = filteredTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => (acc += transaction.amount), 0)

  const totalExpenses =
    filteredTransactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((acc, transaction) => (acc += transaction.amount), 0) * -1

  const expensesPercentage = Math.round((totalExpenses / totalIncomes) * 100) || 0
  const incomesPercentage = 100 - expensesPercentage || 0

  if (totalIncomes === 0 && totalExpenses === 0) {
    return (
      <div className="bg-zinc-900 p-6 rounded-lg flex items-center justify-center flex-col">
        <BsPieChartFill className="text-6xl md:text-8xl text-neutral-700" />
        <h1 className="text-xl md:text-2xl font-bold my-3 text-neutral-400">Aún no hay datos</h1>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-2">
      <VictoryPie
        colorScale={["#fd204d", "#51bd20"]}
        data={[
          { x: "Gastos", y: expensesPercentage },
          { x: "Ingresos", y: incomesPercentage },
        ]}
        animate={{ duration: 200 }}
        labels={({ datum }) => `${datum.x}: ${datum.y}%`}
        labelComponent={
          <VictoryLabel
            style={{
              fill: "white",
              fontSize: 14,
              fontWeight: "bold",
            }}
          />
        }
        padding={{ top: 20, bottom: 20, left: 80, right: 80 }}
        height={280}
        width={350}
        responsive={true}
      />
    </div>
  )
}

