import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { DashboardLayout } from '@/shared/components/layout'
import { useDebounce } from '@/shared/hooks'
import { ServiceOrderCard } from '../components/ServiceOrderCard'
import { ServiceOrderDetailView } from '../components/ServiceOrderDetailView'
import { useOrders, useOrderCounts } from '@/features/dashboard/hooks'
import type { OrderResponse } from '@/features/dashboard/types'
import { cn } from '@/shared/utils'

export function ServiceOrderMaterialsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'unscheduled')
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  
  // Estados para contadores
  const [stats, setStats] = useState({
    unscheduled: 0,
    scheduled: 0,
    success: 0,
    failure: 0,
  })
  
  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Leer página de la URL
  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  }, [searchParams])
  
  const [perPage] = useState(20)

  // Actualizar URL cuando cambia el debouncedSearch
  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (debouncedSearch.trim()) {
        newParams.set('search', debouncedSearch.trim())
      } else {
        newParams.delete('search')
      }
      newParams.set('page', '1')
      return newParams
    })
  }, [debouncedSearch, setSearchParams])

  // Actualizar URL cuando cambia el filtro de estado
  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      if (statusFilter && statusFilter !== 'all') {
        newParams.set('status', statusFilter)
      } else {
        newParams.delete('status')
      }
      newParams.set('page', '1')
      return newParams
    })
  }, [statusFilter, setSearchParams])

  // Determinar filtros booleanos basados en statusFilter
  const unscheduled = statusFilter === 'unscheduled' ? true : undefined
  const scheduledState = statusFilter === 'scheduled' ? true : undefined
  const success = statusFilter === 'success' ? true : undefined
  const failure = statusFilter === 'failure' ? true : undefined

  const { data, isLoading, isError, error } = useOrders({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
    unscheduled: unscheduled,
    scheduled_state: scheduledState,
    success: success,
    failure: failure,
  })

  // Obtener contadores usando el endpoint dedicado (con search si existe)
  const { data: countsData } = useOrderCounts(debouncedSearch || undefined)

  // Actualizar estadísticas cuando cambian los datos
  useEffect(() => {
    if (countsData) {
      setStats({
        unscheduled: countsData.unscheduled || 0,
        scheduled: countsData.scheduled || 0,
        success: countsData.success || 0,
        failure: countsData.failed || 0,
      })
    }
  }, [countsData])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('page', newPage.toString())
        return newParams
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (data?.pagination) {
      const totalPages = Math.ceil(
        (data.pagination.total || 0) / Number(data.pagination.per_page)
      )
      if (currentPage < totalPages) {
        const newPage = currentPage + 1
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev)
          newParams.set('page', newPage.toString())
          return newParams
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  // Si hay una orden seleccionada, mostrar la vista de detalle
  if (selectedOrder) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
          <ServiceOrderDetailView
            order={selectedOrder}
            onBack={() => setSelectedOrder(null)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
        {/* Título y contador */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            {t('serviceOrders.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {data?.pagination?.total ?? 0} {t('serviceOrders.ordersCount') || 'órdenes'}
          </p>
        </div>

        {/* Búsqueda */}
        <div className="mb-4 sm:mb-6">
          <div className="w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 min-h-10 sm:min-h-11"
            />
          </div>
        </div>

        {/* Pestañas de estado: grid 2x2 en móvil, fila en desktop */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:border-b sm:border-gray-200 sm:dark:border-gray-700 gap-2 sm:gap-1 sm:gap-0">
            <button
              onClick={() => setStatusFilter('unscheduled')}
              className={cn(
                'rounded-lg sm:rounded-none sm:border-b-2 px-3 py-3 sm:py-3 text-sm font-medium transition-colors text-left sm:text-center border-2 sm:border-b-2 sm:border-transparent',
                statusFilter === 'unscheduled'
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 sm:bg-transparent sm:border-orange-500'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 sm:bg-transparent sm:border-transparent sm:hover:bg-transparent sm:hover:text-gray-900 sm:dark:hover:text-gray-200'
              )}
            >
              <span className="block sm:inline">{t('dashboard.unscheduled')}</span>
              <span className={cn(
                'ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 sm:mt-0',
                statusFilter === 'unscheduled'
                  ? 'bg-orange-200/80 dark:bg-orange-800/50 text-orange-700 dark:text-orange-400 sm:bg-orange-100 sm:dark:bg-orange-900/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 sm:bg-gray-100 sm:dark:bg-gray-800'
              )}>
                {stats.unscheduled}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={cn(
                'rounded-lg sm:rounded-none sm:border-b-2 px-3 py-3 text-sm font-medium transition-colors text-left sm:text-center border-2 sm:border-b-2 sm:border-transparent',
                statusFilter === 'scheduled'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 sm:bg-transparent sm:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 sm:bg-transparent sm:border-transparent sm:hover:bg-transparent sm:hover:text-gray-900 sm:dark:hover:text-gray-200'
              )}
            >
              <span className="block sm:inline">{t('dashboard.scheduled')}</span>
              <span className={cn(
                'ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 sm:mt-0',
                statusFilter === 'scheduled'
                  ? 'bg-blue-200/80 dark:bg-blue-800/50 text-blue-700 dark:text-blue-400 sm:bg-blue-100 sm:dark:bg-blue-900/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 sm:bg-gray-100 sm:dark:bg-gray-800'
              )}>
                {stats.scheduled}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={cn(
                'rounded-lg sm:rounded-none sm:border-b-2 px-3 py-3 text-sm font-medium transition-colors text-left sm:text-center border-2 sm:border-b-2 sm:border-transparent',
                statusFilter === 'success'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 sm:bg-transparent sm:border-green-500'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 sm:bg-transparent sm:border-transparent sm:hover:bg-transparent sm:hover:text-gray-900 sm:dark:hover:text-gray-200'
              )}
            >
              <span className="block sm:inline">{t('dashboard.success')}</span>
              <span className={cn(
                'ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 sm:mt-0',
                statusFilter === 'success'
                  ? 'bg-green-200/80 dark:bg-green-800/50 text-green-700 dark:text-green-400 sm:bg-green-100 sm:dark:bg-green-900/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 sm:bg-gray-100 sm:dark:bg-gray-800'
              )}>
                {stats.success}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('failure')}
              className={cn(
                'rounded-lg sm:rounded-none sm:border-b-2 px-3 py-3 text-sm font-medium transition-colors text-left sm:text-center border-2 sm:border-b-2 sm:border-transparent',
                statusFilter === 'failure'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 sm:bg-transparent sm:border-red-500'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 sm:bg-transparent sm:border-transparent sm:hover:bg-transparent sm:hover:text-gray-900 sm:dark:hover:text-gray-200'
              )}
            >
              <span className="block sm:inline">{t('dashboard.failure')}</span>
              <span className={cn(
                'ml-1 sm:ml-2 px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1 sm:mt-0',
                statusFilter === 'failure'
                  ? 'bg-red-200/80 dark:bg-red-800/50 text-red-700 dark:text-red-400 sm:bg-red-100 sm:dark:bg-red-900/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400 sm:bg-gray-100 sm:dark:bg-gray-800'
              )}>
                {stats.failure}
              </span>
            </button>
          </div>
        </div>

        {/* Estado de carga */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('serviceOrders.loading')}
            </p>
          </div>
        )}

        {/* Estado de error */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : t('serviceOrders.error')}
            </p>
          </div>
        )}

        {/* Grid de órdenes */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {data?.orders?.map((order) => (
                <ServiceOrderCard
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>

            {data?.orders?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('serviceOrders.noOrders')}
                </p>
              </div>
            )}

            {/* Paginación */}
            {data?.pagination && (() => {
              const totalPages = Math.ceil(
                (data.pagination.total || 0) / Number(data.pagination.per_page)
              )
              const currentPageNum = Number(data.pagination.page) || currentPage
              
              if (totalPages <= 1) return null
              
              return (
                <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left order-2 sm:order-1">
                    {t('serviceOrders.paginationInfo', {
                      page: currentPageNum,
                      totalPages: totalPages,
                      total: data.pagination.total,
                    }) || `Página ${currentPageNum} de ${totalPages} (${data.pagination.total} órdenes)`}
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-end order-1 sm:order-2">
                    <Button
                      variant="outline"
                      className="min-h-10 touch-manipulation"
                      onClick={handlePreviousPage}
                      disabled={currentPageNum === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1 shrink-0" />
                      {t('serviceOrders.previous') || 'Anterior'}
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-10 touch-manipulation"
                      onClick={handleNextPage}
                      disabled={currentPageNum >= totalPages || isLoading}
                    >
                      {t('serviceOrders.next') || 'Siguiente'}
                      <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                    </Button>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
