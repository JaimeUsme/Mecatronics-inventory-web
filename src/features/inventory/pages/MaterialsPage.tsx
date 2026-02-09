import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useDebounce } from '@/shared/hooks'
import { MaterialsTable, type Material } from '../components/MaterialsTable'
import { CreateMaterialModal } from '../components/CreateMaterialModal'
import { useMaterials } from '../hooks'

export function MaterialsPage() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(20)
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Debounce del término de búsqueda (p.ej. 500ms después de dejar de escribir)
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isError, error } = useMaterials({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
  })

  const apiMaterials = data?.materials ?? []

  const materials: Material[] = useMemo(
    () =>
      apiMaterials.map((m) => ({
        id: m.id,
        code: m.id, // usar id como código
        name: m.name,
        category: m.category ?? '',
        unit: m.unit ?? '',
        stock: 0, // Mantener para compatibilidad con la interfaz Material, pero no se usa
        minStock: m.minStock ?? 0,
        ownershipType: m.ownershipType ?? 'TECHNICIAN',
        status: 'normal',
        images: m.images ?? undefined,
      })),
    [apiMaterials]
  )

  const filteredMaterials = useMemo(() => {
    // El backend ya filtra por search; aquí solo devolvemos el resultado tal cual
    return materials
  }, [materials])

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {t('materials.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {data?.pagination?.total ?? 0}{' '}
              {t('materials.count', { count: data?.pagination?.total ?? 0 })}
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('materials.create')}
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('materials.searchPlaceholder')}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estados de carga / error */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('materials.loading') || 'Cargando materiales...'}
            </p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : t('materials.error') || 'Error al cargar materiales'}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Table */}
            <MaterialsTable materials={filteredMaterials} />

            {/* Paginación */}
            {data?.pagination && data.pagination.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('materials.paginationInfo', {
                    page: data.pagination.page,
                    totalPages: data.pagination.total_pages,
                    total: data.pagination.total,
                  })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t('materials.previous') || 'Anterior'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (
                        data &&
                        currentPage < data.pagination.total_pages
                      ) {
                        setCurrentPage((prev) => prev + 1)
                      }
                    }}
                    disabled={
                      !data ||
                      currentPage >= data.pagination.total_pages ||
                      isLoading
                    }
                  >
                    {t('materials.next') || 'Siguiente'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <CreateMaterialModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </div>
    </DashboardLayout>
  )
}


