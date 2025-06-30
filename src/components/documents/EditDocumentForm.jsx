import { useEffect, useState } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"

export function EditDocumentForm({ documentId, onClose, onSaved }) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!documentId || !currentUser) return
    const fetchData = async () => {
      setLoading(true)
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("user_id", currentUser.id)
        .single()
      if (docError) { setError("No se pudo cargar el documento"); setLoading(false); return }
      // Inicializar todos los campos controlados con string vacío si vienen undefined
      setForm({
        title: doc.title || "",
        client_name: doc.client_name || "",
        client_email: doc.client_email || "",
        description: doc.description || "",
        total: doc.total ?? 0,
        paid: doc.paid ?? 0,
        paid_ARS: doc.paid_ARS ?? 0,
        paid_USD: doc.paid_USD ?? 0,
        payment_method: doc.payment_method || "",
        type: doc.type || "factura",
        company_name: doc.company_name || "",
        id: doc.id,
      })
      const { data: itemsData } = await supabase
        .from("document_items")
        .select("*")
        .eq("document_id", documentId)
      setItems((itemsData || []).map(item => ({
        ...item,
        description: item.description || "",
        quantity: item.quantity ?? 1,
        unit_price: item.unit_price ?? 0,
        currency: item.currency || "ARS",
        bonificado: item.bonificado ?? false,
      })))
      setLoading(false)
    }
    fetchData()
  }, [documentId, currentUser])

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const handleItemChange = (idx, field, value) => setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  const handleAddItem = () => setItems(items => [...items, { description: "", quantity: 1, unit_price: 0, currency: "ARS", bonificado: false }])
  const handleRemoveItem = idx => setItems(items => items.filter((_, i) => i !== idx))

  // Calcular totales y pagos por moneda
  const getTotalsByCurrency = (currency) => {
    if (!form) return { total: 0, paid: 0, due: 0 } // Protección contra null
    const total = items.filter(i => i.currency === currency).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0)
    // Nuevo: permitir ingresar pagos por moneda
    const paid = form[`paid_${currency}`] !== undefined && form[`paid_${currency}`] !== null ? Number(form[`paid_${currency}`]) : 0
    return { total, paid, due: total - paid }
  }

  const totalARS = getTotalsByCurrency("ARS")
  const totalUSD = getTotalsByCurrency("USD")
  const total = totalARS.total + totalUSD.total
  const due = total - (form?.paid || 0)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!form.title || !form.client_name || !form.company_name || !items.length) return setError("Completa todos los campos obligatorios")
    setLoading(true)
    // Actualizar documento
    // Validar y limpiar payload antes de enviar
    // Guardar pagos por moneda en el documento
    const payload = {
      title: form.title,
      client_name: form.client_name,
      client_email: form.client_email,
      description: form.description,
      total: isNaN(total) ? 0 : total,
      paid_ARS: Number(form.paid_ARS) || 0,
      paid_USD: Number(form.paid_USD) || 0,
      payment_method: form.payment_method || null,
      type: form.type,
      company_name: form.company_name,
    }
    // Eliminar campos undefined/null
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) delete payload[key]
    })
    const { error: docError } = await supabase.from("documents").update(payload)
      .eq("id", documentId).eq("user_id", currentUser.id)
    if (docError) { setError(docError.message); setLoading(false); return }
    // Actualizar items (borrado y re-inserción simplificada)
    await supabase.from("document_items").delete().eq("document_id", documentId)
    for (const item of items) {
      const { error: itemError } = await supabase.from("document_items").insert([
        { document_id: documentId, description: item.description, quantity: item.quantity, unit_price: item.unit_price, currency: item.currency, bonificado: item.bonificado }
      ])
      if (itemError) { setError(itemError.message); setLoading(false); return }
    }
    setSuccess("Documento actualizado correctamente")
    setLoading(false)
    onSaved && onSaved()
    setTimeout(() => { setSuccess(""); onClose && onClose() }, 1200)
  }

  if (!documentId || !form) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-2xl p-3 sm:p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[98vh]">
        <h3 className="text-xl font-bold mb-3 sm:mb-4 text-white">Editar Documento</h3>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Empresa emisora *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={form.company_name} onChange={e => handleChange("company_name", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Tipo</label>
              <select className="w-full p-2 rounded bg-neutral-700 text-white" value={form.type} onChange={e => handleChange("type", e.target.value)}>
                <option value="factura">Factura</option>
                <option value="recibo">Recibo</option>
                <option value="orden">Orden de Servicio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Título *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Cliente *</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={form.client_name} onChange={e => handleChange("client_name", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Email Cliente</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={form.client_email} onChange={e => handleChange("client_email", e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Descripción General</label>
            <textarea className="w-full p-2 rounded bg-neutral-700 text-white" value={form.description} onChange={e => handleChange("description", e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Items *</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center w-full">
                  <input
                    className="p-2 rounded bg-neutral-700 text-white flex-1 min-w-0"
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
                    step="0.01"
                    onChange={e => handleItemChange(idx, "unit_price", parseFloat(e.target.value))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Método de Pago</label>
              <input className="w-full p-2 rounded bg-neutral-700 text-white" value={form.payment_method} onChange={e => handleChange("payment_method", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Saldo Abonado</label>
              <input type="number" className="w-full p-2 rounded bg-neutral-700 text-white" value={form.paid} min={0} onChange={e => handleChange("paid", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Pagado en Pesos ($)</label>
              <input type="number" className="w-full p-2 rounded bg-neutral-700 text-white" value={form.paid_ARS ?? ""} min={0} onChange={e => handleChange("paid_ARS", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Pagado en Dólares (U$)</label>
              <input type="number" className="w-full p-2 rounded bg-neutral-700 text-white" value={form.paid_USD ?? ""} min={0} onChange={e => handleChange("paid_USD", e.target.value)} />
            </div>
          </div>
          <div className="mb-4 flex justify-between items-center">
            <span className="font-bold text-white">Total: ${total.toFixed(2)}</span>
            <span className="font-bold text-white">Saldo a abonar: ${due.toFixed(2)}</span>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors text-white"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70 text-white"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
