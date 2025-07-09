import { VictoryPie, VictoryLabel } from "victory"
import { useGlobalState } from "../contexts/GlobalState"
import { BsPieChartFill } from "react-icons/bs"

export function ExpenseChart({ categoryId }) {
  const { transactions } = useGlobalState()

  // Filter transactions by category if categoryId is provided
  const filteredTransactions = categoryId ? transactions.filter((t) => t.category_id === categoryId) : transactions

  const totalIncomes = filteredTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0)

  const totalExpenses =
    filteredTransactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((acc, transaction) => acc + Math.abs(transaction.amount), 0)

  const total = totalIncomes + totalExpenses
  const incomesPercentage = total > 0 ? Math.round((totalIncomes / total) * 100) : 0
  const expensesPercentage = total > 0 ? Math.round((totalExpenses / total) * 100) : 0

  // Usar valores absolutos para el gráfico
  const chartData = [
    { x: "Gastos", y: totalExpenses },
    { x: "Ingresos", y: totalIncomes },
  ]
  // Calcular porcentajes reales con decimales
  const getPercent = (val) => (total > 0 ? ((val / total) * 100).toFixed(2) : "0.00")

  if (total === 0) {
    return (
      <div className="bg-app p-6 rounded-lg flex items-center justify-center flex-col">
        <BsPieChartFill className="text-6xl md:text-8xl text-app-secondary" />
        <h1 className="text-xl md:text-2xl font-bold my-3 text-app-secondary">Aún no hay datos</h1>
      </div>
    )
  }

  return (
    <div className="bg-app rounded-lg p-2 flex flex-col items-center w-full">
      <VictoryPie
        colorScale={["#fd204d", "#51bd20"]}
        data={chartData}
        animate={{ duration: 200 }}
        labels={({ datum }) => `${datum.x}: ${getPercent(datum.y)}%`}
        labelComponent={
          <VictoryLabel
            style={{
              fill: "var(--color-text)",
              fontSize: 14,
              fontWeight: "bold",
            }}
            labelPlacement="perpendicular"
            textAnchor="middle"
            radius={90}
          />
        }
        padding={{ top: 10, bottom: 10, left: 10, right: 10 }}
        height={220}
        width={220}
        responsive={true}
      />
      <div className="flex flex-row flex-wrap justify-center items-center gap-4 mt-2 w-full">
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="font-bold text-red-500 dark:text-red-400 text-sm">Gastos</span>
          <span className="text-app-secondary text-xs">
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {getPercent(totalExpenses)}%)
          </span>
        </div>
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="font-bold text-green-600 dark:text-green-400 text-sm">Ingresos</span>
          <span className="text-app-secondary text-xs">
            ${totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {getPercent(totalIncomes)}%)
          </span>
        </div>
      </div>
    </div>
  )
}

