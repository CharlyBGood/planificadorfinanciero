"use client"

import { AuthProvider } from "./contexts/AuthContext"
import { GlobalProvider } from "./contexts/GlobalState"
import { useAuth } from "./contexts/AuthContext"
import { AuthScreen } from "./components/auth/AuthScreen"
import { Dashboard } from "./components/dashboard/Dashboard"
import { CategoryView } from "./components/dashboard/CategoryView"
import { DocumentView } from "./components/documents/DocumentView"
import { useState, useEffect } from "react"
import "./App.css"

// Main app component that shows either auth screen or main app
function AppContent() {
  const { currentUser, logout } = useAuth()
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  if (!currentUser) {
    return <AuthScreen />
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setActiveView("category")
  }

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document)
    setActiveView("document")
  }

  const handleBackToDashboard = () => {
    setActiveView("dashboard")
    setSelectedCategory(null)
    setSelectedDocument(null)
  }

  return (
    <GlobalProvider>
      <div className={"min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300 p-2 sm:p-4 md:p-8 lg:p-12"}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-neutral-900 py-4 px-3 sm:px-6 rounded-t-lg flex flex-col sm:flex-row justify-between items-center gap-2 shadow-md">
            <button
              onClick={handleBackToDashboard}
              className={`text-2xl md:text-3xl lg:text-4xl font-bold text-indigo-700 dark:text-white ${activeView === "dashboard" ? "cursor-default" : "hover:text-indigo-400 transition-colors"}`}
            >
              Planificador Financiero
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full p-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Cambiar modo claro/oscuro"
                title="Cambiar modo claro/oscuro"
              >
                {theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
                )}
              </button>
              <button onClick={logout} className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 px-3 py-1 rounded text-sm text-neutral-900 dark:text-white transition-colors">
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-b-lg shadow-xl overflow-hidden">
            {activeView === "dashboard" ? (
              <Dashboard onCategorySelect={handleCategorySelect} onDocumentSelect={handleDocumentSelect} />
            ) : activeView === "category" ? (
              <CategoryView category={selectedCategory} onBack={handleBackToDashboard} />
            ) : activeView === "document" ? (
              <DocumentView documentId={selectedDocument?.id} onBack={handleBackToDashboard} />
            ) : null}
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

