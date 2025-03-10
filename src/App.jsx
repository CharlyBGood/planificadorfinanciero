"use client"

import { AuthProvider } from "./contexts/AuthContext"
import { GlobalProvider } from "./contexts/GlobalState"
import { useAuth } from "./contexts/AuthContext"
import { AuthScreen } from "./components/auth/AuthScreen"
import { Dashboard } from "./components/dashboard/Dashboard"
import { CategoryView } from "./components/dashboard/CategoryView"
import { useState } from "react"
import "./App.css"

// Main app component that shows either auth screen or main app
function AppContent() {
  const { currentUser, logout } = useAuth()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedCategory, setSelectedCategory] = useState(null)

  if (!currentUser) {
    return <AuthScreen />
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setActiveView("category")
  }

  const handleBackToDashboard = () => {
    setActiveView("dashboard")
    setSelectedCategory(null)
  }

  return (
    <GlobalProvider>
      <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-neutral-900 py-4 px-6 rounded-t-lg flex justify-between items-center">
            <button
              onClick={handleBackToDashboard}
              className={`text-2xl md:text-3xl lg:text-4xl font-bold ${activeView === "dashboard" ? "cursor-default" : "hover:text-indigo-400 transition-colors"}`}
            >
              Planificador Financiero
            </button>
            <button onClick={logout} className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm">
              Cerrar Sesión
            </button>
          </div>

          <div className="bg-neutral-800 rounded-b-lg shadow-xl overflow-hidden">
            {activeView === "dashboard" ? (
              <Dashboard onCategorySelect={handleCategorySelect} />
            ) : (
              <CategoryView category={selectedCategory} onBack={handleBackToDashboard} />
            )}
          </div>
        </div>
      </div>
    </GlobalProvider>
  )
}

// Wrapper component that provides authentication context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

