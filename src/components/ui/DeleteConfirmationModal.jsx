"use client"

import { useEffect, useRef } from "react"

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, transactionDescription, title = "Confirmar eliminación", message, confirmLabel = "Eliminar" }) {
  const modalRef = useRef(null)

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-neutral-800 rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
      >
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="mb-6">
          {message ? message : (
            <>¿Estás seguro que deseas eliminar la transacción <span className="font-semibold">"{transactionDescription}"</span>?</>
          )}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

