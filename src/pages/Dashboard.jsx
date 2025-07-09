import { useState, useEffect } from "react"
import { supabase } from "../supabase/config"
import { useAuth } from "../contexts/AuthContext"
import { CategoryCard } from "../components/dashboard/CategoryCard"
import { CreateCategoryModal } from "../components/dashboard/CreateCategoryModal"
import { DocumentForm } from "../components/documents/DocumentForm"
import { DocumentList } from "../components/documents/DocumentList"
import { PlusCircle, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false)
  const [createType, setCreateType] = useState(null)
  const [activeTab, setActiveTab] = useState("objetivos")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        setError("Error al cargar las categorías")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
    const channel = supabase
      .channel("public:categories")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          fetchCategories()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser])

  const handleCreateCategory = async (categoryData) => {
    try {
      const { error } = await supabase.from("categories").insert([
        {
          name: categoryData.name,
          description: categoryData.description,
          target_amount: categoryData.targetAmount || null,
          color: categoryData.color || "#6366F1",
          user_id: currentUser.id,
        },
      ])
      if (error) throw error
      setIsCreateModalOpen(false)
    } catch (err) {
      setError("Error al crear la categoría")
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId).eq("user_id", currentUser.id)
      if (error) throw error
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    } catch (err) {
      setError("Error al eliminar la categoría")
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <main className="bg-neutral-100 dark:bg-neutral-950 min-h-[1px] w-full p-2 sm:p-4">
      <section className="w-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <div className="flex w-full sm:w-auto gap-2 justify-center sm:justify-end">
            <button
              onClick={() => setActiveTab("objetivos")}
              className={`flex-1 sm:flex-none min-w-[100px] max-w-xs px-3 py-2 rounded-lg font-semibold transition-colors text-base ${activeTab === "objetivos" ? "bg-indigo-600 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
              aria-current={activeTab === "objetivos"}
            >
              Objetivos
            </button>
            <button
              onClick={() => setActiveTab("documentos")}
              className={`flex-1 sm:flex-none min-w-[100px] max-w-xs px-3 py-2 rounded-lg font-semibold transition-colors text-base ${activeTab === "documentos" ? "bg-green-600 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
              aria-current={activeTab === "documentos"}
            >
              Documentos
            </button>
          </div>
          <div className="flex w-full sm:w-auto gap-2 justify-center sm:justify-end">
            <button
              onClick={() => { setCreateType('category'); setIsCreateModalOpen(true); }}
              className="flex-1 sm:flex-none min-w-[100px] max-w-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-base justify-center"
              aria-label="Nuevo Objetivo"
            >
              <PlusCircle size={18} />
              <span>Nuevo Objetivo</span>
            </button>
            <button
              onClick={() => { setCreateType('document'); setIsCreateDocumentOpen(true); }}
              className="flex-1 sm:flex-none min-w-[100px] max-w-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-base justify-center"
              aria-label="Nueva Factura/Recibo/Orden"
            >
              <FileText size={18} />
              <span>Nueva Factura/Recibo</span>
            </button>
          </div>
        </div>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-center">{error}</div>}
        <div className="w-full">
          {activeTab === "objetivos" ? (
            categories.length === 0 ? (
              <div className="bg-neutral-700 rounded-lg p-6 text-center mx-auto max-w-md">
                <h3 className="text-lg font-medium mb-2">No tienes objetivos financieros</h3>
                <p className="text-neutral-400 mb-4">Crea tu primer objetivo para comenzar a gestionar tus finanzas</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <PlusCircle size={18} />
                  <span>Crear Objetivo</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} onClick={() => navigate(`/category/${category.id}`)} onDelete={handleDeleteCategory} />
                ))}
              </div>
            )
          ) : (
            <DocumentList onSelect={(doc) => navigate(`/document/${doc.id}`)} />
          )}
        </div>
        <CreateCategoryModal
          isOpen={isCreateModalOpen && createType === 'category'}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCategory}
        />
        {isCreateDocumentOpen && createType === 'document' && (
          <DocumentForm isOpen={isCreateDocumentOpen} onClose={() => setIsCreateDocumentOpen(false)} />
        )}
      </section>
    </main>
  )
}
