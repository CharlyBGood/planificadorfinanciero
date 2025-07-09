import { useEffect, useState } from "react"
import { supabase } from "../../supabase/config"
import { useAuth } from "../../contexts/AuthContext"
import { Trash2 } from "lucide-react"
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal"

export function DocumentList({ onSelect }) {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [docToDelete, setDocToDelete] = useState(null)

  useEffect(() => {
    if (!currentUser) return
    const fetchDocuments = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
      if (!error) setDocuments(data)
      setLoading(false)
    }
    fetchDocuments()
  }, [currentUser])

  useEffect(() => {
    setFilteredDocuments(
      documents.filter(doc => {
        const text = `${doc.title || ""} ${doc.type || ""} ${doc.client_name || ""}`.toLowerCase()
        return text.includes(search.toLowerCase())
      })
    )
  }, [search, documents])

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!docToDelete) return
    setDeletingId(docToDelete.id)
    setError("")
    setShowDeleteModal(false)
    // Eliminar items primero (integridad referencial)
    await supabase.from("document_items").delete().eq("document_id", docToDelete.id)
    const { error } = await supabase.from("documents").delete().eq("id", docToDelete.id)
    if (error) setError("No se pudo eliminar el documento")
    setDocuments(docs => docs.filter(d => d.id !== docToDelete.id))
    setDeletingId(null)
    setDocToDelete(null)
  }

  if (loading) return <div className="p-4 text-center text-neutral-400">Cargando documentos...</div>
  if (!filteredDocuments.length) return <div className="p-4 text-center text-neutral-400">No hay facturas/recibos/órdenes que coincidan.</div>

  return (
    <div className="bg-app-secondary p-2 sm:p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-3 sm:mb-4 text-center text-app">Facturas / Recibos / Órdenes</h3>
      <div className="mb-3 sm:mb-4 w-full">
        <label htmlFor="search-documents" className="block text-xs sm:text-sm font-medium mb-1 text-app">Buscar</label>
        <input
          id="search-documents"
          name="search-documents"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título, tipo o cliente..."
          className="w-full px-3 py-2 rounded bg-app-secondary text-app placeholder-app-secondary border border-app focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Buscar documentos"
        />
      </div>
      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-2 rounded mb-2 text-center">{error}</div>}
      <ul className="space-y-2 sm:space-y-3 max-h-[350px] overflow-y-auto pr-1 sm:pr-2">
        {filteredDocuments.map(doc => (
          <li
            key={doc.id}
            className="bg-app-secondary rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-colors group gap-2 sm:gap-0 border border-app"
            onClick={e => { if (e.target.tagName !== 'BUTTON' && onSelect) onSelect(doc) }}
            tabIndex={0}
            aria-label={`Ver documento ${doc.title || doc.type}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-app mr-0 sm:mr-2">{doc.title || doc.type}</span>
              <span className="text-xs text-app-secondary">{doc.client_name}</span>
            </div>
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <span className="text-sm text-app-secondary">{doc.created_at?.slice(0,10)}</span>
              <button
                type="button"
                className="ml-2 text-red-400 hover:text-red-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                aria-label="Eliminar documento"
                onClick={e => { e.stopPropagation(); handleDeleteClick(doc) }}
                disabled={deletingId === doc.id}
                title="Eliminar documento"
              >
                {deletingId === doc.id ? <span className="animate-spin">⏳</span> : <Trash2 size={18} />}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDocToDelete(null) }}
        onConfirm={handleConfirmDelete}
        transactionDescription={docToDelete ? (docToDelete.title || docToDelete.type || "") : ""}
      />
    </div>
  )
}
