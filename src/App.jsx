"use client"

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { GlobalProvider } from "./contexts/GlobalState"
import { useAuth } from "./contexts/AuthContext"
import { CategoryView } from "./components/dashboard/CategoryView"
import { DocumentView } from "./components/documents/DocumentView"
import { useState, useEffect } from "react"
import Navbar from "./components/ui/Navbar"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import "./App.css"

function PrivateRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/auth" />
}

function AppContent() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <GlobalProvider>
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] pt-20 bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
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
      </main>
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

