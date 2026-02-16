import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Pencil, Trash2, X } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Card } from '@/shared/components/ui/card'
import { useLocations, useDeleteLocation } from '../hooks'
import { CreateLocationModal } from '../components/CreateLocationModal'
import { EditLocationModal } from '../components/EditLocationModal'
import type { LocationResponse as ApiLocationResponse } from '../types'

type LocationType = 'warehouse' | 'technician' | 'crew'

interface Location {
  id: string
  type: LocationType
  name: string
  externalId?: string | null
  active: boolean
  createdAt: string
}

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function LocationsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | LocationType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [locationToEdit, setLocationToEdit] = useState<ApiLocationResponse | null>(null)
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null)

  // Determinar los parámetros para el query
  const activeParam: boolean | undefined =
    statusFilter === 'all' ? undefined : statusFilter === 'active'

  // Convertir el tipo del filtro local al tipo de la API
  const typeParam: 'WAREHOUSE' | 'TECHNICIAN' | 'CREW' | undefined =
    typeFilter === 'all'
      ? undefined
      : typeFilter === 'warehouse'
      ? 'WAREHOUSE'
      : typeFilter === 'crew'
      ? 'CREW'
      : 'TECHNICIAN'

  const { data, isLoading, isError, error } = useLocations({
    type: typeParam,
    active: activeParam,
  })
  const deleteLocation = useDeleteLocation()

  const apiLocations = data ?? []

  const locations: Location[] = useMemo(
    () =>
      apiLocations.map((loc) => ({
        id: loc.id,
        type: loc.type === 'WAREHOUSE' ? 'warehouse' : loc.type === 'CREW' ? 'crew' : 'technician',
        name: loc.name,
        externalId: loc.referenceId,
        active: loc.active,
        createdAt: loc.createdAt,
      })),
    [apiLocations]
  )

  // Filtrar solo por búsqueda local (el tipo y estado ya se filtran en el backend)
  const filteredLocations = useMemo(() => {
    const term = search.toLowerCase().trim()
    return locations.filter((loc) => {
      const matchesSearch =
        !term ||
        loc.name.toLowerCase().includes(term) ||
        (loc.externalId ?? '').toLowerCase().includes(term)
      return matchesSearch
    })
  }, [search, locations])

  const getTypeBadge = (type: LocationType) => {
    if (type === 'warehouse') {
      return {
        label: t('locations.type.warehouse'),
        className:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      }
    }
    if (type === 'crew') {
      return {
        label: t('locations.type.crew') || 'Cuadrilla',
        className:
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      }
    }
    return {
      label: t('locations.type.technician'),
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t('locations.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {t('locations.subtitle')}
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-h-10 touch-manipulation"
              onClick={() => setIsCreateOpen(true)}
            >
              {t('locations.new')}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-4 sm:mb-6 p-4">
          <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:flex-wrap">
            <div className="w-full lg:flex-1 min-w-0">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('locations.searchPlaceholder')}
                  className="pl-9 sm:pl-10 min-h-10 sm:min-h-11"
                />
              </div>
            </div>

            <div className="w-full lg:w-56 min-w-0">
              <Select
                value={typeFilter}
                onValueChange={(val) => setTypeFilter(val as 'all' | LocationType)}
              >
                <SelectTrigger className="min-h-10 sm:min-h-11">
                  <SelectValue placeholder={t('locations.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('locations.filters.typeAll')}
                  </SelectItem>
                  <SelectItem value="warehouse">
                    {t('locations.type.warehouse')}
                  </SelectItem>
                  <SelectItem value="technician">
                    {t('locations.type.technician')}
                  </SelectItem>
                  <SelectItem value="crew">
                    {t('locations.type.crew') || 'Cuadrilla'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-56 min-w-0">
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as 'all' | 'active' | 'inactive')}
              >
                <SelectTrigger className="min-h-10 sm:min-h-11">
                  <SelectValue placeholder={t('locations.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('locations.filters.statusAll')}
                  </SelectItem>
                  <SelectItem value="active">
                    {t('locations.status.active')}
                  </SelectItem>
                  <SelectItem value="inactive">
                    {t('locations.status.inactive')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-full lg:w-auto gap-3">
              <Input type="date" className="w-full lg:w-40 min-h-10 sm:min-h-11" />
              <Input type="date" className="w-full lg:w-40 min-h-10 sm:min-h-11" />
            </div>

            <Button
              variant="outline"
              className="w-full lg:w-auto min-h-10 touch-manipulation"
              onClick={() => {
                setSearch('')
                setTypeFilter('all')
                setStatusFilter('all')
              }}
            >
              {t('locations.clearFilters')}
            </Button>
          </div>
        </Card>

        {/* Tabla / estados */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('locations.loading') || 'Cargando ubicaciones...'}
            </p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : t('locations.error') || 'Error al cargar ubicaciones'}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Lista en tarjetas: solo móvil */}
            <div className="md:hidden space-y-3">
              {filteredLocations.map((loc) => {
                const typeBadge = getTypeBadge(loc.type)
                return (
                  <Card key={loc.id} className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {loc.name}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${typeBadge.className}`}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('locations.columns.externalId')}: {loc.externalId || t('locations.noExternalId')}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            loc.active
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {loc.active
                            ? t('locations.status.active')
                            : t('locations.status.inactive')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(loc.createdAt, i18n.language || 'es-ES')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-9 touch-manipulation border-gray-300 dark:border-gray-700"
                          onClick={() => {
                            navigate(`/dashboard/inventory/stock?locationId=${loc.id}`)
                          }}
                        >
                          {t('locations.viewInventory')}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 touch-manipulation border-gray-300 dark:border-gray-700"
                          onClick={() => {
                            const apiLocation = apiLocations.find((apiLoc) => apiLoc.id === loc.id)
                            if (apiLocation) setLocationToEdit(apiLocation)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 touch-manipulation border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => setLocationToDelete(loc)}
                          disabled={deleteLocation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Tabla: solo desktop */}
            <Card className="overflow-hidden hidden md:block">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">{t('locations.columns.type')}</th>
                      <th className="px-6 py-3">{t('locations.columns.name')}</th>
                      <th className="px-6 py-3">
                        {t('locations.columns.externalId')}
                      </th>
                      <th className="px-6 py-3">
                        {t('locations.columns.status')}
                      </th>
                      <th className="px-6 py-3">
                        {t('locations.columns.createdAt')}
                      </th>
                      <th className="px-6 py-3 text-right">
                        {t('locations.columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {filteredLocations.map((loc) => {
                      const typeBadge = getTypeBadge(loc.type)
                      return (
                        <tr
                          key={loc.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeBadge.className}`}
                            >
                              {typeBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                            {loc.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {loc.externalId || t('locations.noExternalId')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                loc.active
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {loc.active
                                ? t('locations.status.active')
                                : t('locations.status.inactive')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(loc.createdAt, i18n.language || 'es-ES')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                className="h-8 px-3 border-gray-300 dark:border-gray-700"
                                onClick={() => {
                                  navigate(`/dashboard/inventory/stock?locationId=${loc.id}`)
                                }}
                              >
                                {t('locations.viewInventory')}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-300 dark:border-gray-700"
                                onClick={() => {
                                  const apiLocation = apiLocations.find((apiLoc) => apiLoc.id === loc.id)
                                  if (apiLocation) {
                                    setLocationToEdit(apiLocation)
                                  }
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => setLocationToDelete(loc)}
                                disabled={deleteLocation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        <CreateLocationModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

        <EditLocationModal
          open={!!locationToEdit}
          location={locationToEdit}
          onClose={() => setLocationToEdit(null)}
        />

        {/* Modal de confirmación para eliminar */}
        {locationToDelete && (
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
                        {t('locations.deleteTitle')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setLocationToDelete(null)}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={t('locations.close')}
                        disabled={deleteLocation.isPending}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="pl-16">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {t('locations.deleteMessage', {
                      name: locationToDelete.name,
                    }) ||
                      `¿Estás seguro de que deseas eliminar la ubicación "${locationToDelete.name}"? Esta acción no se puede deshacer.`}
                  </p>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setLocationToDelete(null)}
                      disabled={deleteLocation.isPending}
                      className="min-w-[100px]"
                    >
                      {t('materials.cancel') || 'Cancelar'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await deleteLocation.mutateAsync(locationToDelete.id)
                          setLocationToDelete(null)
                        } catch (error) {
                          console.error('Error deleting location', error)
                        }
                      }}
                      disabled={deleteLocation.isPending}
                      className="min-w-[100px]"
                    >
                      {deleteLocation.isPending
                        ? t('locations.deleting')
                        : t('locations.delete')}
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


