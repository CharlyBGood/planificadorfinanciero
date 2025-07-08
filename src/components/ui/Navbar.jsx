import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"

export default function Navbar({ theme, setTheme }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/", { replace: true })
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row justify-between items-center gap-2 py-4 px-3 sm:px-6 bg-white dark:bg-neutral-900 shadow-md">
      <button
        onClick={() => navigate(currentUser ? "/dashboard" : "/")}
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-indigo-700 dark:text-white hover:text-indigo-400 transition-colors"
      >
        Planificador Financiero
      </button>
      <div className="flex items-center gap-2">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        {currentUser ? (
          <button onClick={handleLogout} className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 px-3 py-1 rounded text-sm text-neutral-900 dark:text-white transition-colors">
            Cerrar Sesión
          </button>
        ) : (
          <button onClick={() => navigate("/auth")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition-colors">
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  )
}
