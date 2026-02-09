import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  TrendingUp,
  Package,
  Warehouse,
  User,
  Users,
  ArrowRight,
  X,
  ChevronRight,
  Minus,
  Calendar as CalendarIcon,
} from 'lucide-react'
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
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useMovements, useMovementStats } from '../hooks'
import { useMaterials } from '../hooks'
import { useLocations } from '../hooks'
import { CreateTransferModal } from '../components/CreateTransferModal'
import { cn } from '@/shared/utils'
import type { MovementResponse } from '../types/movements.types'
import type { LocationResponse } from '../types'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return 'Hoy'
  } else if (diffInDays === 1) {
    return 'Ayer'
  } else {
    return `hace ${diffInDays} días`
  }
}

function getCategoryBadge(category: string) {
  const categoryColors: Record<string, string> = {
    CABLEADO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CONECTORES: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    EQUIPOS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    GENERAL: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  }
  return (
    categoryColors[category] ||
    'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  )
}

export function TransfersPage() {
  const { t, i18n } = useTranslation()
  // Estados para los filtros (se aplican automáticamente)
  const [search, setSearch] = useState('')
  const [materialFilter, setMaterialFilter] = useState<string>('all')
  const [fromLocationFilter, setFromLocationFilter] = useState<string>('all')
  const [toLocationFilter, setToLocationFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [isCreateTransferOpen, setIsCreateTransferOpen] = useState(false)

  const { data: materialsData } = useMaterials({ per_page: 100 })
  const materials = materialsData?.materials ?? []

  const { data: locationsData } = useLocations()
  const locations: LocationResponse[] = Array.isArray(locationsData) ? locationsData : []

  const { data: movementsData, isLoading, isError, error } = useMovements({
    page: 1,
    per_page: 20,
    materialId: materialFilter !== 'all' ? materialFilter : undefined,
    fromLocationId: fromLocationFilter !== 'all' ? fromLocationFilter : undefined,
    toLocationId: toLocationFilter !== 'all' ? toLocationFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    fromDate: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
    toDate: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
  })

  const { data: statsData } = useMovementStats()

  // Helper function to determine location type
  const getLocationType = (
    locationId: string | null
  ): 'WAREHOUSE' | 'TECHNICIAN' | 'CREW' => {
    if (!locationId) return 'WAREHOUSE'
    const location = locations.find((loc) => loc.id === locationId)
    if (!location) return 'WAREHOUSE'
    return location.type === 'TECHNICIAN'
      ? 'TECHNICIAN'
      : location.type === 'CREW'
      ? 'CREW'
      : 'WAREHOUSE'
  }


  const movements: MovementResponse[] = useMemo(() => {
    if (!movementsData?.movements) return []
    return movementsData.movements
  }, [movementsData])

  const stats = statsData ?? {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  }

  const handleClearFilters = () => {
    setSearch('')
    setMaterialFilter('all')
    setFromLocationFilter('all')
    setToLocationFilter('all')
    setTypeFilter('all')
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const dateLocale = i18n.language === 'es' ? es : enUS

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t('transfers.title')}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{t('transfers.breadcrumb.panel')}</span>
                <ChevronRight className="h-4 w-4" />
                <span>{t('transfers.breadcrumb.inventory')}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {t('transfers.breadcrumb.transfers')}
                </span>
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsCreateTransferOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('transfers.newTransfer')}
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('transfers.stats.today')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.today}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('transfers.stats.thisWeek')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.thisWeek}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('transfers.stats.thisMonth')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('transfers.searchPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Material Filter */}
            <div className="w-full lg:w-56">
              <Select value={materialFilter} onValueChange={setMaterialFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('transfers.filters.material')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('transfers.filters.selectMaterial')}</SelectItem>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Location Filter */}
            <div className="w-full lg:w-56">
              <Select value={fromLocationFilter} onValueChange={setFromLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('transfers.filters.fromLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('transfers.filters.selectFromLocation')}</SelectItem>
                  {locations.map((location: LocationResponse) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* To Location Filter */}
            <div className="w-full lg:w-56">
              <Select value={toLocationFilter} onValueChange={setToLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('transfers.filters.toLocation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('transfers.filters.selectToLocation')}</SelectItem>
                  {locations.map((location: LocationResponse) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-56">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('transfers.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('transfers.filters.allTypes')}</SelectItem>
                  <SelectItem value="TRANSFER">{t('transfers.filters.transfer')}</SelectItem>
                  <SelectItem value="CONSUMPTION">{t('transfers.filters.consumption')}</SelectItem>
                  <SelectItem value="DAMAGED">{t('transfers.filters.damaged')}</SelectItem>
                  <SelectItem value="ADJUSTMENT">{t('transfers.filters.adjustment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="w-full lg:w-auto flex flex-col lg:flex-row gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full lg:w-[200px] justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? (
                      format(dateFrom, 'PPP', { locale: dateLocale })
                    ) : (
                      <span>{t('transfers.filters.dateFrom') || 'Desde'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full lg:w-[200px] justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? (
                      format(dateTo, 'PPP', { locale: dateLocale })
                    ) : (
                      <span>{t('transfers.filters.dateTo') || 'Hasta'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    locale={dateLocale}
                    disabled={(date: Date) => dateFrom ? date < dateFrom : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
              <X className="h-4 w-4 mr-2" />
              {t('transfers.clearFilters')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{t('transfers.loading')}</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : t('transfers.error')}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <Card className="overflow-hidden">
            <div className="w-full overflow-x-auto lg:overflow-x-visible">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">{t('transfers.columns.date')}</th>
                    <th className="px-6 py-3">{t('transfers.columns.material')}</th>
                    <th className="px-6 py-3">{t('transfers.columns.quantity')}</th>
                    <th className="px-6 py-3">{t('transfers.columns.fromTo')}</th>
                    <th className="px-6 py-3">{t('transfers.columns.technician')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('transfers.noItems')}
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => {
                      const categoryBadge = getCategoryBadge(movement.materialCategory)
                      const fromLocationType = getLocationType(movement.fromLocationId)
                      const toLocationType = movement.toLocationId ? getLocationType(movement.toLocationId) : null
                      return (
                        <tr
                          key={movement.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDate(movement.createdAt, i18n.language || 'es-ES')}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getRelativeTime(movement.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {movement.materialName}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit',
                                  categoryBadge
                                )}
                              >
                                {movement.materialCategory}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {movement.quantity} {movement.materialUnit}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                {fromLocationType === 'WAREHOUSE' ? (
                                  <Warehouse className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                ) : fromLocationType === 'CREW' ? (
                                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                )}
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {movement.fromLocationName}
                                </span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <div className="flex items-center gap-1.5">
                                {movement.type === 'DAMAGED' || movement.type === 'CONSUMPTION' || !movement.toLocationId || !movement.toLocationName ? (
                                  <>
                                    <Minus className="h-4 w-4 text-red-500 dark:text-red-400" />
                                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                      {movement.type === 'DAMAGED' 
                                        ? t('transfers.damage') || 'Daño'
                                        : t('transfers.expense') || 'Gasto'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {toLocationType === 'WAREHOUSE' ? (
                                      <Warehouse className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    ) : toLocationType === 'CREW' ? (
                                      <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    ) : (
                                      <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {movement.toLocationName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {movement.technicianId ? (
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {t('transfers.technician')}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                    {movement.technicianId.substring(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t('transfers.noTechnician')}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Create Transfer Modal */}
        <CreateTransferModal
          open={isCreateTransferOpen}
          onClose={() => setIsCreateTransferOpen(false)}
        />
      </div>
    </DashboardLayout>
  )
}

