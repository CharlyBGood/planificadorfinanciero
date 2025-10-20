import { VictoryPie, VictoryLabel } from "victory"
import { useGlobalState } from "../contexts/GlobalState"
import { BsPieChartFill } from "react-icons/bs"

export function ExpenseChart({ categoryId, targetAmount }) {
  const { transactions } = useGlobalState()

  // Filtrar transacciones por categoría si corresponde
  const filteredTransactions = categoryId ? transactions.filter((t) => t.category_id === categoryId) : transactions

  // Calcular ingresos y egresos
  const totalIncomes = filteredTransactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0)

  // Obtener la meta (target)
  // Si no viene por prop, buscarla en la categoría (requiere prop extra o contexto)
  const meta = typeof targetAmount === "number" ? targetAmount : 0
  if (!meta || meta <= 0) {
    // Si no hay meta, mostrar el chart original
    return (
      <div className="bg-app p-6 rounded-lg flex items-center justify-center flex-col">
        <BsPieChartFill className="text-6xl md:text-8xl text-app-secondary" />
        <h1 className="text-xl md:text-2xl font-bold my-3 text-app-secondary">Aún no hay meta definida</h1>
      </div>
    )
  }

  // Calcular proporciones respecto a la meta
  let green = Math.max(0, Math.min(1, totalIncomes / meta))
  let red = Math.max(0, Math.min(1, totalExpenses / meta))
  // Si egresos > ingresos, el rojo puede ser mayor que el verde
  if (red > green) {
    red = Math.min(1, red)
    green = 0
  } else {
    green = green - red
  }
  const gray = Math.max(0, 1 - (green + red))

  // Datos para el gráfico
  const chartData = [
    { x: "Restante", y: gray },
    { x: "Gastos", y: red },
    { x: "Ingresos", y: green },
  ]

  // Si no hay movimientos
  if (totalIncomes === 0 && totalExpenses === 0) {
    return (
      <div className="bg-app p-6 rounded-lg flex items-center justify-center flex-col">
        <BsPieChartFill className="text-6xl md:text-8xl text-app-secondary" />
        <h1 className="text-xl md:text-2xl font-bold my-3 text-app-secondary">Aún no hay datos</h1>
      </div>
    )
  }

  // Función para mostrar porcentaje
  const getPercent = (val) => ((val * 100).toFixed(2))

  return (
    <div className="bg-app rounded-lg p-2 flex flex-col items-center w-full">
      <VictoryPie
        colorScale={["#d1d5db", "#fd204d", "#51bd20"]} // gris, rojo, verde
        data={chartData}
        animate={{ duration: 200 }}
        labels={({ datum }) => datum.x !== "Restante" ? `${datum.x}: ${getPercent(datum.y)}%` : null}
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
          <span className="font-bold text-green-600 dark:text-green-400 text-sm">Ingresos</span>
          <span className="text-app-secondary text-xs">
            ${totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {getPercent(green)}%)
          </span>
        </div>
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="font-bold text-red-500 dark:text-red-400 text-sm">Gastos</span>
          <span className="text-app-secondary text-xs">
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {getPercent(red)}%)
          </span>
        </div>
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="font-bold text-app-secondary text-sm">Restante</span>
          <span className="text-app-secondary text-xs">
            ${Math.max(0, meta - (totalIncomes - totalExpenses)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
            {getPercent(gray)}%)
          </span>
        </div>
      </div>
    </div>
  )
}

