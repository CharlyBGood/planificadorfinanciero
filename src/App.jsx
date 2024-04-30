import React from "react";
import { GlobalProvider } from "./contexts/GlobalState";
import Balance from "./components/Balance";
import TransactionForm from "./components/transactions/TransactionForm";
import TransactionList from "./components/transactions/TransactionList";
import IncomeExpenses from "./components/IncomeExpenses";
import ExpenseChart from "./components/ExpenseChart";
import './App.css'

function App() {
  return (
    <GlobalProvider>
      <div className="main-container">
        
          <div className="forms-container">
            <div className="flex-1 p-1">
              <IncomeExpenses />
              <Balance />
              <TransactionForm />
            </div>
            <div className="p-4 w-2/4">
              <ExpenseChart />
              <TransactionList />
            </div>
          </div>
        
      </div>
    </GlobalProvider>
  );
}

export default App;
