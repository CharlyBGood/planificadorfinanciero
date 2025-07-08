"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { GlobalProvider } from "./contexts/GlobalState"
import { useAuth } from "./contexts/AuthContext"
import { AuthScreen } from "./components/auth/AuthScreen"
import { Dashboard } from "./components/dashboard/Dashboard"
import { CategoryView } from "./components/dashboard/CategoryView"
import { DocumentView } from "./components/documents/DocumentView"
import { useState, useEffect } from "react"
import Navbar from "./components/ui/Navbar"
import Home from "./components/Home"
import "./App.css"

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/auth" />
}

function AppContent() {
  const { currentUser } = useAuth()
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <GlobalProvider>
      <div className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <Navbar theme={theme} setTheme={setTheme} />
          <div className="h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300 overflow-hidden">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col pt-20">
              <div className="flex-1 bg-white dark:bg-neutral-800 rounded-b-lg shadow-xl overflow-auto flex flex-col">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<AuthScreen />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/category/:id" element={
                    <PrivateRoute>
                      <CategoryView />
                    </PrivateRoute>
                  } />
                  <Route path="/document/:id" element={
                    <PrivateRoute>
                      <DocumentView />
                    </PrivateRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

