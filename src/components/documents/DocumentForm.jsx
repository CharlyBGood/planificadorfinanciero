import { useState, useEffect } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"

export function DocumentForm({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [description, setDescription] = useState("")
  const [items, setItems] = useState([
    { description: "", quantity: 1, unit_price: 0, currency: "PESOS" },
  ])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paidARS, setPaidARS] = useState(0)
  const [paidUSD, setPaidUSD] = useState(0)
  const [type, setType] = useState("factura")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [logoFile, setLogoFile] = useState(null)
  const [logoUrl, setLogoUrl] = useState("")

  // Load draft when modal opens
  useEffect(() => {
    if (!isOpen) return
    try {
      const raw = sessionStorage.getItem('docDraft_new')
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.title) setTitle(draft.title)
        if (draft.clientName) setClientName(draft.clientName)
        if (draft.clientEmail) setClientEmail(draft.clientEmail)
        if (draft.description) setDescription(draft.description)
        if (Array.isArray(draft.items) && draft.items.length) setItems(draft.items)
        if (draft.paymentMethod) setPaymentMethod(draft.paymentMethod)
        if (draft.paidARS !== undefined) setPaidARS(draft.paidARS)
        if (draft.paidUSD !== undefined) setPaidUSD(draft.paidUSD)
        if (draft.type) setType(draft.type)
        if (draft.companyName) setCompanyName(draft.companyName)
        if (draft.logoUrl) setLogoUrl(draft.logoUrl)
      }
    } catch (err) {
      console.error('[DocumentForm] load draft error', err)
    }
  }, [isOpen])

  // Auto-save draft while modal is open
  useEffect(() => {
    if (!isOpen) return
    const draft = { title, clientName, clientEmail, description, items, paymentMethod, paidARS, paidUSD, type, companyName, logoUrl }
    try { sessionStorage.setItem('docDraft_new', JSON.stringify(draft)) } catch (err) { console.error('[DocumentForm] save draft error', err) }
  }, [isOpen, title, clientName, clientEmail, description, items, paymentMethod, paidARS, paidUSD, type, companyName, logoUrl])

  const handleItemChange = (idx, field, value) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, currency: "PESOS" }])
  }

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  // Calcular totales y pagos por moneda
  const getTotalsByCurrency = (currency) => {
    const total = items.filter(i => i.currency === currency).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0)
    // Aceptar ambos nombres para compatibilidad, pero usar paidARS/paidUSD en el estado
    const paid = currency === "PESOS" ? Number(paidARS) : Number(paidUSD)
    return { total, paid, due: total - paid }
  }

  const totalPESOS = getTotalsByCurrency("PESOS")
  const totalUSD = getTotalsByCurrency("USD")
  const usesBoth = totalPESOS.total > 0 && totalUSD.total > 0
  const usesOnlyPESOS = totalPESOS.total > 0 && totalUSD.total === 0
  const usesOnlyUSD = totalUSD.total > 0 && totalPESOS.total === 0

  const total = totalPESOS.total + totalUSD.total

  // Subida de logo a Supabase Storage
  async function uploadLogoIfNeeded() {
    console.log("[uploadLogoIfNeeded] logoFile:", logoFile);
    if (!logoFile) {
      console.log("[uploadLogoIfNeeded] No hay archivo para subir");
      return "";
    }
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `logo_${Date.now()}.${fileExt}`;
    console.log("[uploadLogoIfNeeded] Subiendo archivo:", fileName, logoFile);
    try {
      const { error } = await supabase.storage.from('document_logos').upload(fileName, logoFile, {
        upsert: false,
        contentType: logoFile.type || 'image/png'
      });
      console.log("[uploadLogoIfNeeded] Resultado del upload:", error);
      if (error) {
        setError("Error al subir logo: " + error.message);
        return "";
      }
      const { data: publicUrl } = supabase.storage.from('document_logos').getPublicUrl(fileName);
      console.log("[uploadLogoIfNeeded] publicUrl:", publicUrl);
      return publicUrl?.publicUrl || "";
    } catch (err) {
      console.error("[uploadLogoIfNeeded] Excepción en upload:", err);
      setError("Error inesperado al subir logo: " + err.message);
      return "";
    }
  }

  // Modifica handleSubmit para subir el logo antes de guardar el documento
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!currentUser) return setError("No autenticado")
    if (!title || !clientName || !items.length || !companyName) return setError("Completa todos los campos obligatorios")
    setSaving(true)
    let logo_url = logoUrl;

    if (logoFile) {
      logo_url = await uploadLogoIfNeeded();
      setLogoUrl(logo_url);
      if (!logo_url) {
        setSaving(false);
        return; // No continuar si hubo error al subir el logo
      }
    }
    // 1. Crear documento con pagos diferenciados
    const payload = {
      user_id: currentUser.id,
      type,
      title,
      client_name: clientName,
      client_email: clientEmail,
      description,
      total,
      paid_pesos: Number(paidARS) || 0,
      paid_usd: Number(paidUSD) || 0,
      payment_method: paymentMethod,
      company_name: companyName,
      logo_url,
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
        }
      ])
      if (itemError) { setError(itemError.message); setSaving(false); return }
    }
    setSuccess("Documento guardado correctamente")
    // Clear draft since document was saved
    try { sessionStorage.removeItem('docDraft_new') } catch (err) { /* ignore */ }
    setTitle(""); setClientName(""); setClientEmail(""); setDescription(""); setItems([{ description: "", quantity: 1, unit_price: 0, currency: "PESOS" }]); setPaymentMethod(""); setPaidARS(0); setPaidUSD(0); setType("factura"); setCompanyName("")
    setSaving(false)
    setTimeout(() => { setSuccess(""); onClose && onClose() }, 1200)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
      <div className="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl mx-auto animate-in fade-in zoom-in duration-200 max-h-[98vh] overflow-y-auto p-2 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white text-center leading-tight">Nueva Factura / Recibo / Orden</h3>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded mb-2 text-xs sm:text-sm">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-2 rounded mb-2 text-xs sm:text-sm">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="companyName">Empresa emisora *</label>
              <input
                id="companyName"
                aria-required="true"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="type">Tipo</label>
              <select
                id="type"
                aria-required="true"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="factura">Factura</option>
                <option value="recibo">Recibo</option>
                <option value="orden">Orden de Servicio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="title">Título *</label>
              <input
                id="title"
                aria-required="true"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="clientName">Cliente *</label>
              <input
                id="clientName"
                aria-required="true"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="clientEmail">Email Cliente</label>
              <input
                id="clientEmail"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Logo de la empresa (opcional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 rounded bg-neutral-700 text-white"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setLogoFile(e.target.files[0]);
                  setLogoUrl("");
                }
              }}
            />
            {logoFile && (
              <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="mt-2 h-16 object-contain bg-white rounded" />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Descripción General</label>
            <textarea
              className="w-full p-2 rounded bg-neutral-700 text-white"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-white">Items *</label>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    className="p-2 rounded bg-neutral-700 text-white flex-1 min-w-0"
                    placeholder="Descripción"
                    value={item.description}
                    onChange={e => handleItemChange(idx, "description", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-neutral-700 text-white w-full sm:w-16"
                    placeholder="Cant."
                    value={item.quantity}
                    min={1}
                    onChange={e => handleItemChange(idx, "quantity", Number(e.target.value))}
                    required
                  />
                  <input
                    type="number"
                    className="p-2 rounded bg-neutral-700 text-white w-full sm:w-24"
                    placeholder="Precio"
                    value={item.unit_price}
                    min={0}
                    onChange={e => handleItemChange(idx, "unit_price", Number(e.target.value))}
                    required
                  />
                  <select
                    className="p-2 rounded bg-neutral-700 text-white w-full sm:w-auto"
                    value={item.currency}
                    onChange={e => handleItemChange(idx, "currency", e.target.value)}
                  >
                    <option value="PESOS">Pesos</option>
                    <option value="USD">Dólares</option>
                  </select>
                  <button type="button" className="text-red-400 hover:text-red-600 ml-0 sm:ml-2" onClick={() => handleRemoveItem(idx)} aria-label="Eliminar item">✕</button>
                </div>
              ))}
              <button type="button" className="text-green-400 hover:text-green-600 mt-2" onClick={handleAddItem} aria-label="Agregar item">+ Agregar Item</button>
            </div>
          </div>
          {/* Total centralizado y detalle por moneda */}
          <div className="mb-4">
            <div className="bg-neutral-900 rounded-lg p-4 flex flex-col gap-2 items-center">
              {usesBoth && (
                <span className="font-bold text-white text-lg">
                  Total en pesos: ${totalPESOS.total.toFixed(2)} &nbsp;|&nbsp; Total en dólares: U${totalUSD.total.toFixed(2)}
                </span>
              )}
              {usesOnlyPESOS && (
                <span className="font-bold text-white text-lg">
                  Total en pesos: ${totalPESOS.total.toFixed(2)}
                </span>
              )}
              {usesOnlyUSD && (
                <span className="font-bold text-white text-lg">
                  Total en dólares: U${totalUSD.total.toFixed(2)}
                </span>
              )}
              <div className="flex flex-col sm:flex-row gap-2 w-full justify-center mt-2">
                {totalPESOS.total > 0 && (
                  <div className="flex-1 bg-neutral-800 rounded p-2 text-center">
                    <span className="block text-white font-semibold">PESOS</span>
                    <span className="text-white">Total: ${totalPESOS.total.toFixed(2)}</span>
                    <span className="block text-green-400">Pagado: ${totalPESOS.paid.toFixed(2)}</span>
                    <span className="block text-red-400">Saldo: ${totalPESOS.due.toFixed(2)}</span>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 rounded bg-neutral-700 text-white"
                      min={0}
                      value={paidARS}
                      onChange={e => setPaidARS(e.target.value)}
                      placeholder="Pagado en PESOS"
                    />
                  </div>
                )}
                {totalUSD.total > 0 && (
                  <div className="flex-1 bg-neutral-800 rounded p-2 text-center">
                    <span className="block text-white font-semibold">USD</span>
                    <span className="text-white">Total: U${totalUSD.total.toFixed(2)}</span>
                    <span className="block text-green-400">Pagado: U${totalUSD.paid.toFixed(2)}</span>
                    <span className="block text-red-400">Saldo: U${totalUSD.due.toFixed(2)}</span>
                    <input
                      type="number"
                      className="w-full mt-1 p-2 rounded bg-neutral-700 text-white"
                      min={0}
                      value={paidUSD}
                      onChange={e => setPaidUSD(e.target.value)}
                      placeholder="Pagado en USD"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-white" htmlFor="paymentMethod">Método de Pago</label>
              <input
                id="paymentMethod"
                className="w-full p-2 rounded bg-neutral-700 text-white"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              />
            </div>
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
              className="btn-app bg-indigo-600 hover:bg-indigo-700 text-app"
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
