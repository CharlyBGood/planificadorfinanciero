import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useEffect } from "react"

export default function Home() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard", { replace: true })
    }
  }, [currentUser, navigate])

  return (
    <main className="bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white min-h-[1px] w-full p-4 flex justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col items-center gap-6 mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 dark:text-white mb-2">
          ¡Te damos la bienvenida!
        </h1>
        <p className="text-lg text-center text-neutral-600 dark:text-neutral-300 mb-4">
          Gestiona tus objetivos, facturas y finanzas personales de forma simple, visual y segura.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/auth" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-semibold text-center transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  )
}
