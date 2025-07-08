"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (currentUser) {
      // Si está en una ruta pública, redirigir a dashboard
      if (["/", "/auth", "/#", "#", ""].includes(location.pathname + location.hash)) {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [currentUser, navigate, location])

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Planificador Financiero</h1>
        <p className="text-neutral-400">Gestiona tus finanzas desde cualquier dispositivo</p>
      </div>

      {isLogin ? <LoginForm onToggleForm={toggleForm} /> : <RegisterForm onToggleForm={toggleForm} />}
    </div>
  )
}

