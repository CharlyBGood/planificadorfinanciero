import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"

function LoginForm({ onToggleForm }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { supabase } = useAuth() || {} // fallback if not in context

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md p-4 mx-auto animate-in fade-in zoom-in duration-200">
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-center">Iniciar Sesión</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded mb-2 text-xs sm:text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-3 flex flex-col justify-center">
          <div>
            <input
              type="email"
              className="w-full p-3 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white text-neutral-900 py-3 rounded-lg font-semibold border border-neutral-300 hover:bg-neutral-100 transition-colors"
          disabled={loading}
        >
          <span className="text-lg">G</span> Iniciar con Google
        </button>
        <div className="text-center mt-4">
          <button className="text-indigo-400 hover:underline text-sm" onClick={onToggleForm}>
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onToggleForm }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { supabase } = useAuth() || {}

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md p-4 mx-auto animate-in fade-in zoom-in duration-200">
        <h2 className="text-lg sm:text-xl font-bold mb-3 text-center">Crear Cuenta</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded mb-2 text-xs sm:text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-3 flex flex-col justify-center">
          <div>
            <input
              type="email"
              className="w-full p-3 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full p-3 rounded bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>
        <button
          onClick={handleGoogleRegister}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white text-neutral-900 py-3 rounded-lg font-semibold border border-neutral-300 hover:bg-neutral-100 transition-colors"
          disabled={loading}
        >
          <span className="text-lg">G</span> Registrarse con Google
        </button>
        <div className="text-center mt-4">
          <button className="text-indigo-400 hover:underline text-sm" onClick={onToggleForm}>
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (currentUser) {
      if (["/", "/auth", "/#", "#", ""].includes(location.pathname + location.hash)) {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [currentUser, navigate, location])

  const toggleForm = () => setIsLogin((v) => !v)

  return (
    <div className="bg-neutral-950 p-4">
      <div className="text-center mb-6">
        <p className="text-neutral-400">Gestiona tus finanzas desde cualquier dispositivo</p>
      </div>
      {isLogin ? <LoginForm onToggleForm={toggleForm} /> : <RegisterForm onToggleForm={toggleForm} />}
    </div>
  )
}
