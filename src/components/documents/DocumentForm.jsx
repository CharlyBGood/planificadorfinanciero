import { useState } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"

export function DocumentForm({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_price: 0, currency: "ARS", bonificado: false },
  ])
  const [paymentMethod, setPaymentMethod] = useState("")
  // Cambios: pagos diferenciados por moneda
  const [paidARS, setPaidARS] = useState(0)
  const [paidUSD, setPaidUSD] = useState(0)
  const [type, setType] = useState("factura")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [companyName, setCompanyName] = useState("")

  const handleItemChange = (idx, field, value) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, currency: "ARS", bonificado: false }])
  }

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  // Calcular totales y pagos por moneda
  const getTotalsByCurrency = (currency) => {
    const total = items.filter(i => i.currency === currency).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0)
    const paid = currency === "ARS" ? Number(paidARS) : Number(paidUSD)
    return { total, paid, due: total - paid }
  }

  const totalARS = getTotalsByCurrency("ARS")
  const totalUSD = getTotalsByCurrency("USD")
  const total = totalARS.total + totalUSD.total

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!currentUser) return setError("No autenticado")
    if (!title || !clientName || !items.length || !companyName) return setError("Completa todos los campos obligatorios")
    setSaving(true)
    // 1. Crear documento con pagos diferenciados
    const payload = {
      user_id: currentUser.id,
      type,
      title,
      client_name: clientName,
      client_email: clientEmail,
      description,
      total,
      paid_ARS: Number(paidARS) || 0,
      paid_USD: Number(paidUSD) || 0,
      payment_method: paymentMethod,
      company_name: companyName,
    }
    // Eliminar campos undefined/null
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key]
    })
    const { data: doc, error: docError } = await supabase.from("documents").insert([
      payload
    ]).select().single()
    if (docError) { setError(docError.message); setSaving(false); return }
    // 2. Crear items
    for (const item of items) {
      const { error: itemError } = await supabase.from("document_items").insert([
        {
          document_id: doc.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency: item.currency,
          bonificado: item.bonificado,
        }
      ])
      if (itemError) { setError(itemError.message); setSaving(false); return }
    }
    setSuccess("Documento guardado correctamente")
    setTitle(""); setClientName(""); setClientEmail(""); setDescription(""); setItems([{ description: "", quantity: 1, unit_price: 0, currency: "ARS", bonificado: false }]); setPaymentMethod(""); setPaidARS(0); setPaidUSD(0); setType("factura"); setCompanyName("")
    setSaving(false)
    setTimeout(() => { setSuccess(""); onClose && onClose() }, 1200)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl p-3 sm:p-6 animate-in fade-in zoom-in duration-200 max-h-[98vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-3 sm:mb-4 text-white">Nueva Factura / Recibo / Orden</h3>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Empresa emisora *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Tipo</label>
              <select className="w-full p-2 rounded bg-neutral-700 text-white" value={type} onChange={e => setType(e.target.value)}>
                <option value="factura">Factura</option>
                <option value="recibo">Recibo</option>
                <option value="orden">Orden de Servicio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Título *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Cliente *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Email Cliente</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Descripción General</label>
            <textarea className="w-full p-2 rounded bg-neutral-700 text-white" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Items *</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    className="p-2 rounded bg-neutral-700 text-white flex-1"
                    placeholder="Descripción"
                    value={item.description}
                    onChange={e => handleItemChange(idx, "description", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-neutral-700 text-white w-16"
                    placeholder="Cant."
                    value={item.quantity}
                    min={1}
                    onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-neutral-700 text-white w-24"
                    placeholder="Precio"
                    value={item.unit_price}
                    min={0}
                    onChange={e => handleItemChange(idx, "unit_price", Number(e.target.value))}
                    required
                  />
                  <select
                    className="p-2 rounded bg-neutral-700 text-white"
                    value={item.currency}
                    onChange={e => handleItemChange(idx, "currency", e.target.value)}
                  >
                    <option value="ARS">$</option>
                    <option value="USD">U$</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-white">
                    <input
                      type="checkbox"
                      checked={item.bonificado}
                      onChange={e => handleItemChange(idx, "bonificado", e.target.checked)}
                    /> Bonificado
                  </label>
                  <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveItem(idx)} aria-label="Eliminar item">✕</button>
                </div>
              ))}
              <button type="button" className="text-green-400 hover:text-green-600 mt-2" onClick={handleAddItem} aria-label="Agregar item">+ Agregar Item</button>
            </div>
          </div>
          {/* Visualización de totales y pagos por moneda */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900 rounded-lg p-3 flex flex-col gap-1">
              <span className="font-bold text-white">Total ARS: ${totalARS.total.toFixed(2)}</span>
              <span className="text-green-400">Pagado ARS: ${totalARS.paid.toFixed(2)}</span>
              <span className="text-red-400">Saldo ARS: ${totalARS.due.toFixed(2)}</span>
              <input type="number" className="w-full mt-1 p-2 rounded bg-neutral-700 text-white" min={0} value={paidARS} onChange={e => setPaidARS(e.target.value)} placeholder="Pagado en ARS" />
            </div>
            <div className="bg-neutral-900 rounded-lg p-3 flex flex-col gap-1">
              <span className="font-bold text-white">Total USD: U$ {totalUSD.total.toFixed(2)}</span>
              <span className="text-green-400">Pagado USD: U$ {totalUSD.paid.toFixed(2)}</span>
              <span className="text-red-400">Saldo USD: U$ {totalUSD.due.toFixed(2)}</span>
              <input type="number" className="w-full mt-1 p-2 rounded bg-neutral-700 text-white" min={0} value={paidUSD} onChange={e => setPaidUSD(e.target.value)} placeholder="Pagado en USD" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Método de Pago</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} />
            </div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <span className="font-bold text-white">Total: ${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors text-white"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70 text-white"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
