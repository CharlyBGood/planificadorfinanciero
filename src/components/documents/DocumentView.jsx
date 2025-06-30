import { useEffect, useState } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"
import { ArrowLeft } from "lucide-react"
import { EditDocumentForm } from "./EditDocumentForm"

export function DocumentView({ documentId, onBack }) {
  const { currentUser } = useAuth()
  const [document, setDocument] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    if (!documentId || !currentUser) return
    const fetchDocument = async () => {
      setLoading(true)
      setError(null)
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("user_id", currentUser.id)
        .single()
      if (docError) {
        setError("No se pudo cargar el documento")
        setLoading(false)
        return
      }
      setDocument(doc)
      const { data: itemsData } = await supabase
        .from("document_items")
        .select("*")
        .eq("document_id", documentId)
      setItems(itemsData || [])
      setLoading(false)
    }
    fetchDocument()
  }, [documentId, currentUser])

  if (loading) return <div className="p-8 text-center text-neutral-400">Cargando documento...</div>
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>
  if (!document) return null

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-2xl mx-auto w-full">
      <button
        onClick={onBack}
        className="mb-3 sm:mb-4 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded text-sm sm:text-base"
        aria-label="Volver a documentos"
      >
        <ArrowLeft size={20} />
        <span className="sr-only">Volver a documentos</span>
        <span>Volver</span>
      </button>
      <div className="bg-neutral-800 rounded-lg p-2 sm:p-4 shadow-lg w-full relative flex flex-col gap-2">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md transition-all"
            aria-label="Editar documento"
          >
            Editar
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-1 sm:gap-2">
          <div className="text-base sm:text-lg font-bold text-white text-left">{document.company_name || <span className="text-neutral-400 font-normal">(Sin empresa)</span>}</div>
          <div className="text-sm sm:text-xl font-bold text-indigo-400 text-right uppercase">{document.type}</div>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 break-words">{document.title || document.type}</h2>
        <div className="text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-base">Cliente: <span className="text-white">{document.client_name}</span></div>
        <div className="text-neutral-400 mb-1 sm:mb-2 text-xs sm:text-base">Fecha: <span className="text-white">{document.created_at?.slice(0,10)}</span></div>
        <div className="text-neutral-400 mb-2 sm:mb-4 text-xs sm:text-base">Tipo: <span className="text-white">{document.type}</span></div>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="bg-neutral-700">
                <th className="px-2 sm:px-3 py-2">#</th>
                <th className="px-2 sm:px-3 py-2">Descripción</th>
                <th className="px-2 sm:px-3 py-2">Cantidad</th>
                <th className="px-2 sm:px-3 py-2">Precio</th>
                <th className="px-2 sm:px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-neutral-700">
                  <td className="px-2 sm:px-3 py-2">{idx + 1}</td>
                  <td className="px-2 sm:px-3 py-2 break-words max-w-[100px] sm:max-w-xs">{item.description}</td>
                  <td className="px-2 sm:px-3 py-2">{item.quantity}</td>
                  <td className="px-2 sm:px-3 py-2">{typeof item.unit_price === 'number' && !isNaN(item.unit_price) ? `${item.currency === 'USD' ? 'U$' : '$'}${item.unit_price.toFixed(2)}` : '-'}</td>
                  <td className="px-2 sm:px-3 py-2">{typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? `${item.currency === 'USD' ? 'U$' : '$'}${(item.unit_price * item.quantity).toFixed(2)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totales diferenciados por moneda */}
        <div className="flex flex-col sm:flex-row sm:justify-end mt-3 sm:mt-4 gap-1 sm:gap-2">
          {['ARS', 'USD'].map(curr => {
            const symbol = curr === 'USD' ? 'U$' : '$';
            const total = items.filter(i => i.currency === curr).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            if (total > 0) {
              return (
                <span key={curr} className="text-base sm:text-lg font-bold text-white">
                  Total {symbol}: {symbol}{total.toFixed(2)}
                </span>
              );
            }
            return null;
          })}
        </div>
        {/* Pagado y saldo a abonar diferenciados por moneda */}
        <div className="flex flex-col sm:flex-row sm:justify-end mt-1 sm:mt-2 gap-1 sm:gap-2">
          {['ARS', 'USD'].map(curr => {
            const symbol = curr === 'USD' ? 'U$' : '$';
            const total = items.filter(i => i.currency === curr).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            const paid = Number(document[`paid_${curr}`]) || 0;
            const saldo = total - paid;
            if (total > 0) {
              return (
                <span key={curr} className="text-xs sm:text-base font-semibold">
                  <span className="mr-2">Pagado {symbol}: <span className="text-green-400">{symbol}{paid.toFixed(2)}</span></span>
                  <span>Pendiente: <span className={saldo > 0 ? "text-red-400" : "text-green-400"}>{symbol}{saldo.toFixed(2)}</span></span>
                </span>
              );
            }
            return null;
          })}
        </div>
        {/* Botón para descargar PDF (opcional, funcionalidad futura) */}
        {/* <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Descargar PDF</button> */}
        {isEditOpen && (
          <EditDocumentForm documentId={documentId} onClose={() => setIsEditOpen(false)} onSaved={() => { setIsEditOpen(false); window.location.reload(); }} />
        )}
      </div>
    </div>
  )
}
