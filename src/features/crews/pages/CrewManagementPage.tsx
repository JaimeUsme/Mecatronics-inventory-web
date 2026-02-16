import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, UserPlus, Pencil, Trash2, Eye, X, RefreshCw } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useCrews } from '../hooks/useCrews'
import { useDeleteCrew } from '../hooks/useDeleteCrew'
import { CreateCrewModal } from '../components/CreateCrewModal'
import { EditCrewModal } from '../components/EditCrewModal'
import { CrewDetailsModal } from '../components/CrewDetailsModal'
import { ReconfigureCrewsWizard } from '../components/ReconfigureCrewsWizard/ReconfigureCrewsWizard'
import type { CrewResponse } from '../types'
import { useDebounce } from '@/shared/hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function CrewManagementPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all'
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isReconfigureWizardOpen, setIsReconfigureWizardOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<CrewResponse | null>(null)
  const [crewToEdit, setCrewToEdit] = useState<CrewResponse | null>(null)
  const [crewToDelete, setCrewToDelete] = useState<CrewResponse | null>(null)

  const debouncedSearch = useDebounce(search, 500)
  const deleteCrew = useDeleteCrew()

  const { data: crewsData, isLoading, isError, error } = useCrews({
    search: debouncedSearch || undefined,
    active:
      statusFilter === 'all'
        ? undefined
        : statusFilter === 'active'
        ? true
        : false,
  })

  const crews: CrewResponse[] = crewsData ?? []

  const formatMembersLabel = (crew: CrewResponse) => {
    const count = crew.members?.length ?? 0
    if (count === 1) {
      return t('crews.members.single', { count })
    }
    return t('crews.members.multiple', { count })
  }

  const formatCreatedAt = (crew: CrewResponse) => {
    try {
      const date = new Date(crew.createdAt)
      return format(date, "dd MMM yyyy", { locale: es })
    } catch {
      return crew.createdAt
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t('crews.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t('crews.subtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="min-h-10 touch-manipulation w-full sm:w-auto"
                onClick={() => setIsReconfigureWizardOpen(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
                {t('crews.reconfigure.button')}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white min-h-10 touch-manipulation w-full sm:w-auto"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2 shrink-0" />
                {t('crews.newCrew')}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6 p-4">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:flex-wrap">
            <div className="w-full lg:flex-1 min-w-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('crews.searchPlaceholder')}
                  className="pl-9 sm:pl-10 min-h-10 sm:min-h-11"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:items-center lg:gap-2">
              <Select defaultValue="all" disabled>
                <SelectTrigger className="w-full sm:min-w-[200px] min-h-10 sm:min-h-11">
                  <SelectValue placeholder={t('crews.filters.allCrews')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('crews.filters.allCrews')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'active' | 'inactive') =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-full sm:min-w-[200px] min-h-10 sm:min-h-11">
                  <SelectValue placeholder={t('crews.filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('crews.filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value="active">
                    {t('crews.filters.active')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('crews.filters.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="min-h-10 touch-manipulation w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                {t('crews.clearFilters')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Lista en tarjetas: solo móvil */}
        <div className="md:hidden space-y-3">
          {isLoading && (
            <Card className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('crews.loading')}
            </Card>
          )}
          {isError && !isLoading && (
            <Card className="p-6 text-center text-sm text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : t('crews.error')}
            </Card>
          )}
          {!isLoading && !isError && crews.length === 0 && (
            <Card className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('crews.noResults')}
            </Card>
          )}
          {!isLoading && !isError && crews.map((crew) => (
            <Card key={crew.id} className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {crew.name}
                    </p>
                    {crew.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {crew.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={
                      crew.active
                        ? 'inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 shrink-0'
                        : 'inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-400 shrink-0'
                    }
                  >
                    {crew.active ? t('crews.status.active') : t('crews.status.inactive')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatMembersLabel(crew)}</span>
                  <span>{formatCreatedAt(crew)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 touch-manipulation border-gray-300 dark:border-gray-700"
                    onClick={() => setSelectedCrew(crew)}
                    title={t('crews.actions.view')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 touch-manipulation border-gray-300 dark:border-gray-700"
                    onClick={() => setCrewToEdit(crew)}
                    title={t('crews.actions.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 touch-manipulation border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => setCrewToDelete(crew)}
                    title={t('crews.actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabla: solo desktop */}
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-sm text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 w-[40%]">
                    {t('crews.columns.name')}
                  </th>
                  <th className="px-6 py-3 w-[20%]">
                    {t('crews.columns.members')}
                  </th>
                  <th className="px-6 py-3 w-[20%]">
                    {t('crews.columns.status')}
                  </th>
                  <th className="px-6 py-3 w-[20%] text-right">
                    {t('crews.columns.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {t('crews.loading')}
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-red-600 dark:text-red-400"
                    >
                      {error instanceof Error
                        ? error.message
                        : t('crews.error')}
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && crews.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {t('crews.noResults')}
                    </td>
                  </tr>
                ) : (
                  !isLoading &&
                  !isError &&
                  crews.map((crew) => (
                    <tr
                      key={crew.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {crew.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {crew.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {formatMembersLabel(crew)}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span
                            className={
                              crew.active
                                ? 'inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 w-fit dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 w-fit dark:bg-gray-800 dark:text-gray-400'
                            }
                          >
                            {crew.active
                              ? t('crews.status.active')
                              : t('crews.status.inactive')}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCreatedAt(crew)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => setSelectedCrew(crew)}
                            title={t('crews.actions.view')}
                          >
                            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-300 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            onClick={() => setCrewToEdit(crew)}
                            title={t('crews.actions.edit')}
                          >
                            <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => setCrewToDelete(crew)}
                            title={t('crews.actions.delete')}
                          >
                            <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Crew Modal */}
        <CreateCrewModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Crew Details Modal */}
        <CrewDetailsModal
          open={selectedCrew !== null}
          crew={selectedCrew}
          onClose={() => setSelectedCrew(null)}
        />

        {/* Edit Crew Modal */}
        <EditCrewModal
          open={crewToEdit !== null}
          crew={crewToEdit}
          onClose={() => setCrewToEdit(null)}
        />

        {/* Reconfigure Crews Wizard */}
        <ReconfigureCrewsWizard
          open={isReconfigureWizardOpen}
          onClose={() => setIsReconfigureWizardOpen(false)}
          onSuccess={() => {
            setIsReconfigureWizardOpen(false)
            // Refrescar la lista de cuadrillas
          }}
        />

        {/* Modal de confirmación para eliminar */}
        {crewToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
              <div className="px-6 pt-6 pb-6">
                {/* Header con icono */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t('crews.deleteTitle') || 'Eliminar cuadrilla'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setCrewToDelete(null)}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={t('crews.details.close')}
                        disabled={deleteCrew.isPending}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="pl-16">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {t('crews.deleteMessage', {
                      name: crewToDelete.name,
                    }) ||
                      `¿Estás seguro de que deseas eliminar la cuadrilla "${crewToDelete.name}"? Esta acción no se puede deshacer.`}
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCrewToDelete(null)}
                      disabled={deleteCrew.isPending}
                      className="min-w-[100px]"
                    >
                      {t('materials.cancel') || 'Cancelar'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await deleteCrew.mutateAsync(crewToDelete.id)
                          setCrewToDelete(null)
                        } catch (error) {
                          console.error('Error deleting crew', error)
                        }
                      }}
                      disabled={deleteCrew.isPending}
                      className="min-w-[100px]"
                    >
                      {deleteCrew.isPending
                        ? t('crews.deleting') || 'Eliminando...'
                        : t('crews.deleteConfirm') || 'Eliminar'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


