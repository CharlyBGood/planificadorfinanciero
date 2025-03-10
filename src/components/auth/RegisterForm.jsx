"use client"

import { useState } from "react"
import { supabase } from "../../supabase/config"

export function RegisterForm({ onToggleForm }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error
      // Success is handled by the auth state listener in AuthProvider
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="register-email" className="block mb-1 text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-neutral-700 rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block mb-1 text-sm font-medium">
            Contraseña
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-neutral-700 rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block mb-1 text-sm font-medium">
            Confirmar Contraseña
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-neutral-700 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-md font-medium disabled:opacity-70"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-400">
        ¿Ya tienes una cuenta?{" "}
        <button onClick={onToggleForm} className="text-indigo-400 hover:underline">
          Iniciar Sesión
        </button>
      </p>
    </div>
  )
}

