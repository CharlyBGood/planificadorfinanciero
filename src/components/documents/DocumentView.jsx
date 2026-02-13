import { useRef, useEffect, useState } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"
import { ArrowLeft } from "lucide-react"
import { EditDocumentForm } from "./EditDocumentForm"
import { useParams, useNavigate } from "react-router-dom"
import { Trash2 } from "lucide-react"
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function DocumentView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [document, setDocument] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const documentRef = useRef(null)
  // Formateo de números con separador de miles (punto) y dos decimales
  const formatNumber = (value) => {
    const n = Number(value)
    if (!isFinite(n)) return "0,00"
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  useEffect(() => {
    if (!id || !currentUser) return
    const fetchDocument = async () => {
      setLoading(true)
      setError(null)
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
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
        .eq("document_id", id)
      setItems(itemsData || [])
      setLoading(false)
    }
    fetchDocument()
  }, [id, currentUser])

  const handleDeleteDocument = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteDocument = async () => {
    await supabase.from("document_items").delete().eq("document_id", id)
    await supabase.from("documents").delete().eq("id", id).eq("user_id", currentUser.id)
    setShowDeleteModal(false)
    navigate(-1)
  }

  const handleDownloadPDF = async () => {
    const element = documentRef.current;
    if (!element) return;
    // Ocultar el botón de descarga temporalmente
    const pdfButton = element.querySelector(".btn-download-pdf");
    if (pdfButton) pdfButton.classList.add("hide-for-pdf");
    // Forzar modo blanco y negro solo para exportar
    element.classList.add("pdf-bw-mode");
    // Esperar a que el DOM se actualice
    await new Promise(res => setTimeout(res, 100));
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#fff" });
    element.classList.remove("pdf-bw-mode");
    if (pdfButton) pdfButton.classList.remove("hide-for-pdf");
    const imgData = canvas.toDataURL("image/png");
    // Ajustar tamaño a A4 si es posible
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Calcular tamaño de imagen para que se adapte a la hoja
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("documento.pdf");
  }

  if (loading) return <div className="p-8 text-center text-neutral-400">Cargando documento...</div>
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>
  if (!document) return null

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-2xl mx-auto w-full bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-lg shadow-lg transition-colors duration-300">
      <div className="flex flex-row sm:justify-between sm:items-center gap-2 border-b border-app pb-2 mb-2">
        <div className="flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="btn-app"
            aria-label="Volver a documentos"
          >
            <ArrowLeft size={18} />
            <span className="sr-only">Volver a documentos</span>
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn-app"
            aria-label="Editar documento"
            title="Editar documento"
          >
            Editar
          </button>
          <button
            onClick={handleDeleteDocument}
            className="btn-app hover:text-red-600 dark:hover:text-red-400 focus:ring-red-400"
            aria-label="Eliminar documento"
            title="Eliminar documento"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
      <div ref={documentRef} id="document-content" className="bg-[var(--color-bg)] rounded-lg p-2 sm:p-4 shadow-lg w-full relative flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-1 sm:gap-2">
          <div className="flex items-center gap-2">
            {document.logo_url && (
              <img src={document.logo_url} alt="Logo" className="h-12 w-auto object-contain bg-white rounded shadow-sm mr-2" style={{maxWidth:'80px'}} />
            )}
            {document.company_name && (
              <span className="text-base sm:text-lg font-bold text-[var(--color-text)] text-left">{document.company_name}</span>
            )}
          </div>
          <div className="text-sm sm:text-xl font-bold text-indigo-700 dark:text-indigo-400 text-right uppercase">{document.type}</div>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 break-words text-[var(--color-text)]">{document.title || document.type}</h2>
        {/* Descripción general (mostrar con preservación de saltos de línea) */}
        {document.description && (
          <div className="text-[var(--color-text-secondary)] mb-1 sm:mb-2 text-xs sm:text-base whitespace-pre-wrap">{document.description}</div>
        )}
        <div className="text-[var(--color-text-secondary)] mb-1 sm:mb-2 text-xs sm:text-base">Cliente: <span className="text-[var(--color-text)]">{document.client_name}</span></div>
        {document.client_email && (
          <div className="text-[var(--color-text-secondary)] mb-1 sm:mb-2 text-xs sm:text-base">Email: <span className="text-[var(--color-text)]">{document.client_email}</span></div>
        )}
        <div className="text-[var(--color-text-secondary)] mb-1 sm:mb-2 text-xs sm:text-base">Fecha: <span className="text-[var(--color-text)]">{document.created_at?.slice(0,10)}</span></div>
        <div className="text-[var(--color-text-secondary)] mb-2 sm:mb-4 text-xs sm:text-base">Tipo: <span className="text-[var(--color-text)]">{document.type}</span></div>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="bg-app-secondary">
                <th className="px-2 sm:px-3 py-2 text-app-secondary font-semibold">#</th>
                <th className="px-2 sm:px-3 py-2 text-app-secondary font-semibold">Descripción</th>
                <th className="px-2 sm:px-3 py-2 text-app-secondary font-semibold">Cantidad</th>
                <th className="px-2 sm:px-3 py-2 text-app-secondary font-semibold">Precio</th>
                <th className="px-2 sm:px-3 py-2 text-app-secondary font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-neutral-700">
                  <td className="px-2 sm:px-3 py-2">{idx + 1}</td>
                  <td className="px-2 sm:px-3 py-2 break-words max-w-[100px] sm:max-w-xs">{item.description}</td>
                  <td className="px-2 sm:px-3 py-2">{item.quantity}</td>
                  <td className="px-2 sm:px-3 py-2">{typeof item.unit_price === 'number' && !isNaN(item.unit_price) ? `${item.currency === 'USD' ? 'U$' : '$'}${formatNumber(item.unit_price)}` : '-'}</td>
                  <td className="px-2 sm:px-3 py-2">{typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? `${item.currency === 'USD' ? 'U$' : '$'}${formatNumber(item.unit_price * item.quantity)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totales diferenciados por moneda. Si no hay precios en items pero existe document.total, mostramos ese total general. */}
        <div className="flex flex-col sm:flex-row sm:justify-end mt-3 sm:mt-4 gap-1 sm:gap-2">
          {(() => {
            const totalPesos = items.filter(i => i.currency === 'PESOS').reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            const totalUsd = items.filter(i => i.currency === 'USD').reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            // If no per-item totals but a document total exists, don't render here
            // (the final summary will show the saved total to avoid duplication)
            if (totalPesos === 0 && totalUsd === 0 && Number(document.total) > 0) {
              return null
            }
            const nodes = [];
            if (totalPesos > 0) nodes.push(<span key="pesos" className="text-base sm:text-lg font-bold text-[var(--color-text)]">Total $: ${formatNumber(totalPesos)}</span>);
            if (totalUsd > 0) nodes.push(<span key="usd" className="text-base sm:text-lg font-bold text-[var(--color-text)]">Total U$: U${formatNumber(totalUsd)}</span>);
            return nodes;
          })()}
        </div>
        {/* Pagado y saldo a abonar diferenciados por moneda */}
        <div className="flex flex-col sm:flex-row sm:justify-end mt-1 sm:mt-2 gap-1 sm:gap-2">
          {['PESOS', 'USD'].map(curr => {
            const symbol = curr === 'USD' ? 'U$' : '$';
            const total = items.filter(i => i.currency === curr).reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            const paid = curr === 'PESOS' ? (Number(document.paid_pesos) || 0) : (Number(document.paid_usd) || 0);
            const saldo = total - paid;
            if (total > 0) {
              return (
                <span key={curr} className="text-xs sm:text-base font-semibold text-[var(--color-text)]">
                  <span className="mr-2">Pagado {symbol}: <span className="text-green-600 dark:text-green-400">{symbol}{formatNumber(paid)}</span></span>
                  <span>Pendiente: <span className={saldo > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>{symbol}{formatNumber(saldo)}</span></span>
                </span>
              );
            }
            return null;
          })}
        </div>
        {/* Total a pagar (resumen final) - mostrar sólo lo que tenga valor */}
        <div className="flex justify-end mt-2">
          {(() => {
            const totalPesos = items.filter(i => i.currency === 'PESOS').reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            const totalUsd = items.filter(i => i.currency === 'USD').reduce((acc, item) => (typeof item.unit_price === 'number' && typeof item.quantity === 'number' && !isNaN(item.unit_price) && !isNaN(item.quantity) ? acc + item.unit_price * item.quantity : acc), 0);
            // Si no hay precios en items pero existe un total guardado, mostrar solo ese total (asumir pesos por defecto)
            if (totalPesos === 0 && totalUsd === 0 && Number(document.total) > 0) {
              return <span className="text-lg font-bold">Total a pagar: ${formatNumber(Number(document.total))}</span>
            }
            const parts = []
            if (totalPesos > 0) parts.push(`Pesos $${formatNumber(totalPesos)}`)
            if (totalUsd > 0) parts.push(`Dólares U$${formatNumber(totalUsd)}`)
            if (parts.length === 0) return null
            return <span className="text-lg font-bold">Total a pagar: {parts.join(' · ')}</span>
          })()}
        </div>
        {/* Botón para descargar PDF (opcional, funcionalidad futura) */}
        <button
          onClick={handleDownloadPDF}
          className="btn-app btn-download-pdf bg-indigo-600 hover:bg-indigo-700 text-app mt-4 w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-base transition-colors"
        >
          Descargar PDF
        </button>
        {isEditOpen && (
          <EditDocumentForm documentId={id} onClose={() => setIsEditOpen(false)} onSaved={() => { setIsEditOpen(false); window.location.reload(); }} />
        )}
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteDocument}
        transactionDescription={document?.title || document?.type || ""}
      />
    </div>
  )
}
