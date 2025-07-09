import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import ThemeToggle from "./ThemeToggle"
import LoginIcon from "../utilities/LoginIcon"
import LogoutIcon from "../utilities/LogoutIcon"
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"
import { useState } from "react"

export default function Navbar({ theme, setTheme }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = async () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    await logout()
    setShowLogoutModal(false)
    navigate("/", { replace: true })
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex flex-row justify-between items-center gap-2 py-2 px-2 sm:px-6 bg-app-secondary shadow-md border-b border-app">
      <button
        onClick={() => navigate(currentUser ? "/dashboard" : "/")}
        className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-indigo-700 dark:text-white hover:text-indigo-400 transition-colors text-center py-1 leading-tight tracking-tight outline-none"
        style={{ wordBreak: 'break-word' }}
      >
        Pfff!
      </button>
      <div className="flex flex-row items-center gap-2 w-auto">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        {currentUser ? (
          <button onClick={handleLogout} className="bg-app hover:bg-app-secondary p-2 rounded-full flex items-center justify-center transition-colors" aria-label="Cerrar Sesión">
            <LogoutIcon />
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="btn-app bg-indigo-600 hover:bg-indigo-700 text-app p-2 rounded-full flex items-center justify-center transition-colors"
            aria-label="Iniciar Sesión"
          >
            <LoginIcon />
          </button>
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas cerrar tu sesión?"
        confirmLabel="Cerrar sesión"
      />
    </nav>
  )
}
