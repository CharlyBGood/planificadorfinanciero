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
    <nav className="fixed top-0 left-0 w-full z-50 flex flex-col sm:flex-row justify-between items-center gap-2 py-2 px-2 sm:px-6 bg-white dark:bg-neutral-900 shadow-md border-b border-neutral-200 dark:border-neutral-800">
      <button
        onClick={() => navigate(currentUser ? "/dashboard" : "/")}
        className="w-full sm:w-auto text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-indigo-700 dark:text-white hover:text-indigo-400 transition-colors text-center py-1 leading-tight tracking-tight"
        style={{ wordBreak: 'break-word' }}
      >
        Planificador Financiero
      </button>
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        {currentUser ? (
          <button onClick={handleLogout} className="w-full sm:w-auto bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 px-3 py-1 rounded text-xs sm:text-sm text-neutral-900 dark:text-white transition-colors mt-2 sm:mt-0">
            Cerrar Sesión
          </button>
        ) : (
          <button onClick={() => navigate("/auth")} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs sm:text-sm transition-colors mt-2 sm:mt-0">
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  )
}
