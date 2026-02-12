import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Plus,
  Boxes,
  Warehouse,
  AlertTriangle,
  Pencil,
  ChevronRight,
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
import { useDebounce } from '@/shared/hooks'
import { useStock, useStockStats } from '../hooks'
import { useLocations } from '../hooks'
import { cn } from '@/shared/utils'
import type { StockItem, StockItemApi } from '../types/stock.types'

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

export function StockManagementPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'low' | 'out_of_stock'>('all')

  const debouncedSearch = useDebounce(search, 500)

  // Leer locationId de la URL y aplicarlo al filtro
  useEffect(() => {
    const locationIdFromUrl = searchParams.get('locationId')
    if (locationIdFromUrl) {
      setLocationFilter(locationIdFromUrl)
      // Limpiar el parámetro de la URL después de aplicarlo
      searchParams.delete('locationId')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const { data: locationsData } = useLocations()
  const locations = locationsData ?? []

  // Mapear el statusFilter del UI al formato del API
  const stockStatusParam = statusFilter !== 'all' ? statusFilter : undefined

  const { data: stockData, isLoading, isError, error } = useStock({
    locationId: locationFilter !== 'all' ? locationFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    stockStatus: stockStatusParam,
    search: debouncedSearch || undefined,
  })

  const { data: statsData } = useStockStats()

  // Mapear y procesar los items del API
  const stockItems: StockItem[] = useMemo(() => {
    if (!stockData?.items) return []
    
    return stockData.items.map((item: StockItemApi) => {
      // Calcular el status basado en stock vs minStock
      let status: 'normal' | 'low' | 'out'
      if (item.stock <= 0) {
        status = 'out'
      } else if (item.minStock !== null && item.stock < item.minStock) {
        status = 'low'
      } else {
        status = 'normal'
      }

      return {
        id: `${item.materialId}-${item.locationId}`, // ID único para cada item
        materialId: item.materialId,
        materialName: item.materialName,
        materialCategory: item.materialCategory,
        materialImages: item.materialImages,
        locationId: item.locationId,
        locationName: item.locationName,
        locationType: item.locationType,
        currentStock: item.stock,
        minStock: item.minStock,
        unit: item.unit,
        status,
        lastUpdated: item.lastUpdated,
      }
    })
  }, [stockData])

  // El backend ya filtra los datos, solo usamos los items tal cual vienen
  const filteredStock = stockItems

  // Usar las métricas del endpoint de stats
  const metrics = statsData ?? {
    totalMaterials: 0,
    totalLocations: 0,
    lowStockCount: 0,
    warehouseOutOfStockCount: 0,
  }

  const getStatusBadge = (status: 'normal' | 'low' | 'out') => {
    if (status === 'normal') {
      return {
        label: t('stock.status.normal'),
        className:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      }
    }
    if (status === 'low') {
      return {
        label: t('stock.status.low'),
        className:
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      }
    }
    return {
      label: t('stock.status.out'),
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
  }

  const getCategoryBadge = (category: string) => {
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

  const handleClearFilters = () => {
    setSearch('')
    setLocationFilter('all')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {t('stock.title')}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{t('stock.breadcrumb.panel')}</span>
                <ChevronRight className="h-4 w-4" />
                <span>{t('stock.breadcrumb.inventory')}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {t('stock.breadcrumb.stock')}
                </span>
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // TODO: Abrir modal de ajustar stock
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('stock.adjustStock')}
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('stock.metrics.totalMaterials')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.totalMaterials}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Boxes className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('stock.metrics.totalLocations')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.totalLocations}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('stock.metrics.lowStockAlerts')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.lowStockCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('stock.metrics.outOfStock')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.warehouseOutOfStockCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('stock.searchPlaceholder')}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="w-full lg:w-56">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('stock.filters.location')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('stock.filters.allLocations')}</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-56">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('stock.filters.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('stock.filters.allCategories')}</SelectItem>
                  <SelectItem value="CABLEADO">CABLEADO</SelectItem>
                  <SelectItem value="CONECTORES">CONECTORES</SelectItem>
                  <SelectItem value="EQUIPOS">EQUIPOS</SelectItem>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-56">
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as 'all' | 'normal' | 'low' | 'out_of_stock')}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('stock.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('stock.filters.allStatuses')}</SelectItem>
                  <SelectItem value="normal">{t('stock.status.normal')}</SelectItem>
                  <SelectItem value="low">{t('stock.status.low')}</SelectItem>
                  <SelectItem value="out_of_stock">{t('stock.status.out')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
              {t('stock.clearFilters')}
            </Button>
          </div>
        </Card>

        {/* Table */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{t('stock.loading')}</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : t('stock.error')}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <Card className="overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3">{t('stock.columns.material')}</th>
                    <th className="px-6 py-3">{t('stock.columns.location')}</th>
                    <th className="px-6 py-3">{t('stock.columns.currentStock')}</th>
                    <th className="px-6 py-3">{t('stock.columns.minStock')}</th>
                    <th className="px-6 py-3">{t('stock.columns.lastUpdated')}</th>
                    <th className="px-6 py-3 text-right">{t('stock.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {filteredStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {t('stock.noItems')}
                      </td>
                    </tr>
                  ) : (
                    filteredStock.map((item) => {
                      const statusBadge = getStatusBadge(item.status)
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {item.materialName}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit',
                                  getCategoryBadge(item.materialCategory)
                                )}
                              >
                                {item.materialCategory}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.locationName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.currentStock} {item.unit}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit',
                                  statusBadge.className
                                )}
                              >
                                {statusBadge.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.minStock === null || item.minStock === 0
                              ? t('stock.noApplicable')
                              : `${item.minStock} ${item.unit}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(item.lastUpdated, i18n.language || 'es-ES')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-gray-300 dark:border-gray-700"
                              onClick={() => {
                                // TODO: Abrir modal de ajustar stock
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
      </div>
    </DashboardLayout>
  )
}

