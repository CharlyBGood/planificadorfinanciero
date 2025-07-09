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
        paid_pesos: doc.paid_pesos ?? 0,
        paid_usd: doc.paid_usd ?? 0,
        payment_method: doc.payment_method || "",
        type: doc.type || "factura",
        company_name: doc.company_name || "",
        id: doc.id,
        user_id: doc.user_id,
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
        // bonificado eliminado
      })))
      setLoading(false)
    }
    fetchData()
  }, [documentId, currentUser])

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const handleItemChange = (idx, field, value) => setItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  const handleAddItem = () => setItems(items => [...items, { description: "", quantity: 1, unit_price: 0, currency: "ARS" }])
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
    // Validar y limpiar payload antes de enviar
    const payload = {
      user_id: currentUser.id,
      type: String(form.type || "factura"),
      title: String(form.title || ""),
      client_name: String(form.client_name || ""),
      client_email: form.client_email ? String(form.client_email) : null,
      description: form.description ? String(form.description) : null,
      total: isNaN(total) ? 0 : Number(total),
      paid_pesos: Number(form.paid_pesos) || 0,
      paid_usd: Number(form.paid_usd) || 0,
      payment_method: form.payment_method ? String(form.payment_method) : null,
      company_name: String(form.company_name || ""),
    }
    // Eliminar campos undefined/null y vacíos
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || (payload[key] === null && key !== 'client_email' && key !== 'description' && key !== 'payment_method')) delete payload[key]
    })
    // Debug: log payload antes de enviar
    console.log('Payload enviado a Supabase:', payload)
    const { error: docError } = await supabase.from("documents").update(payload)
      .eq("id", documentId).eq("user_id", currentUser.id)
    if (docError) { setError(docError.message); setLoading(false); return }
    // Actualizar items (borrado y re-inserción simplificada)
    await supabase.from("document_items").delete().eq("document_id", documentId)
    for (const item of items) {
      const { error: itemError } = await supabase.from("document_items").insert([
        { document_id: documentId, description: item.description, quantity: item.quantity, unit_price: item.unit_price, currency: item.currency }
      ])
      if (itemError) { setError(itemError.message); setLoading(false); return }
    }
    setSuccess("Documento actualizado correctamente")
    setLoading(false)
    onSaved && onSaved()
    setTimeout(() => { setSuccess(""); onClose && onClose() }, 1200)
  }

  if (!form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-app-secondary rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl p-2 sm:p-6 flex flex-col justify-center max-h-[98vh] overflow-y-auto relative mx-auto min-h-[90vh] sm:min-h-0">
        <button
          onClick={onClose}
          className="btn-app absolute top-3 right-3 z-10"
          aria-label="Cerrar edición"
        >
          ✕
        </button>
        <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-app text-center leading-tight break-words">Editar Documento</h3>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-md mb-4 text-xs sm:text-sm">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-md mb-4 text-xs sm:text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-2 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Empresa emisora *</label>
              <input className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.company_name} onChange={e => handleChange("company_name", e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Tipo</label>
              <select className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.type} onChange={e => handleChange("type", e.target.value)}>
                <option value="factura">Factura</option>
                <option value="recibo">Recibo</option>
                <option value="presupuesto">Presupuesto</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-2 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Título *</label>
              <input className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.title} onChange={e => handleChange("title", e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Cliente *</label>
              <input className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.client_name} onChange={e => handleChange("client_name", e.target.value)} required />
            </div>
          </div>
          <div className="mb-2 w-full">
            <label className="block text-sm font-medium mb-1 text-app">Email Cliente</label>
            <input className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.client_email} onChange={e => handleChange("client_email", e.target.value)} />
          </div>
          <div className="mb-2 w-full">
            <label className="block text-sm font-medium mb-1 text-app">Descripción General</label>
            <textarea className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.description} onChange={e => handleChange("description", e.target.value)} />
          </div>
          <div className="mb-2 w-full">
            <label className="block text-sm font-medium mb-1 text-app">Items *</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:gap-2 items-stretch w-full">
                  <input
                    className="p-2 rounded bg-app-secondary text-app border border-app flex-1 min-w-0"
                    placeholder="Descripción"
                    value={item.description}
                    onChange={e => handleItemChange(idx, "description", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-app-secondary text-app border border-app w-full sm:w-16"
                    placeholder="Cant."
                    value={item.quantity}
                    min={1}
                    onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-app-secondary text-app border border-app w-full sm:w-24"
                    placeholder="Precio"
                    value={item.unit_price}
                    min={0}
                    step="0.01"
                    onChange={e => handleItemChange(idx, "unit_price", parseFloat(e.target.value))}
                    required
                  />
                  <select
                    className="p-2 rounded bg-app-secondary text-app border border-app w-full sm:w-auto"
                    value={item.currency}
                    onChange={e => handleItemChange(idx, "currency", e.target.value)}
                  >
                    <option value="ARS">$</option>
                    <option value="USD">U$</option>
                  </select>
                  <button type="button" className="text-red-400 hover:text-red-600 self-center sm:self-auto" onClick={() => handleRemoveItem(idx)} aria-label="Eliminar item">✕</button>
                </div>
              ))}
              <button type="button" className="text-green-400 hover:text-green-600 mt-2" onClick={handleAddItem} aria-label="Agregar item">+ Agregar Item</button>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-2 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Método de Pago</label>
              <input className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.payment_method} onChange={e => handleChange("payment_method", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Saldo Abonado</label>
              <input type="number" className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.paid} min={0} onChange={e => handleChange("paid", Number(e.target.value))} />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 mb-2 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Pagado en Pesos ($)</label>
              <input type="number" className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.paid_ARS ?? ""} min={0} onChange={e => handleChange("paid_ARS", e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-app">Pagado en Dólares (U$)</label>
              <input type="number" className="w-full p-2 rounded bg-app-secondary text-app border border-app" value={form.paid_USD ?? ""} min={0} onChange={e => handleChange("paid_USD", e.target.value)} />
            </div>
          </div>
          <div className="mb-2 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-bold text-app">Total: ${total.toFixed(2)}</span>
            <span className="font-bold text-app">Saldo a abonar: ${due.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 w-full">
            <button
              type="button"
              onClick={onClose}
              className="btn-app bg-app-secondary border border-app"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-app bg-indigo-600 hover:bg-indigo-700 text-app"
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
