import { GlobalProvider } from "./contexts/GlobalState"
import { Header } from "./components/Header"
import { Balance } from "./components/Balance"
import { TransactionForm } from "./components/transactions/TransactionForm"
import { TransactionList } from "./components/transactions/TransactionList"
import { IncomeExpenses } from "./components/IncomeExpenses"
import { ExpenseChart } from "./components/ExpenseChart"
import "./App.css"

function App() {
  return (
    <GlobalProvider>
      <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
          <Header />
          <div className="p-4 md:p-6 lg:p-8">
            {/* Mobile layout: stacked */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <IncomeExpenses />
                  <Balance />
                </div>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Nueva Transacción</h3>
                  <TransactionForm />
                </div>
              </div>

              {/* Right column */}
              <div className="w-full lg:w-1/2 space-y-6">
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 text-center">Distribución</h3>
                  <ExpenseChart />
                </div>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <TransactionList />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalProvider>
  )
}

export default App

