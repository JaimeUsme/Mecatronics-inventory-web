import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { DashboardLayout } from '@/shared/components/layout'
import { useDebounce } from '@/shared/hooks'
import { OrderCard } from '../components'
import { OrderDetailView } from '../components/OrderDetailView'
import { useMyOrders, useMyOrderCounts } from '../hooks'
import type { OrderResponse } from '../types'
import { cn } from '@/shared/utils'

export function MyOrdersPage() {
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
      if (statusFilter !== 'all') {
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

  const { data, isLoading, isError, error } = useMyOrders({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
    unscheduled: unscheduled,
    scheduled_state: scheduledState,
    success: success,
    failure: failure,
  })

  // Obtener contadores usando el endpoint dedicado para mis órdenes (con search si existe)
  const { data: countsData } = useMyOrderCounts(debouncedSearch || undefined)

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

  // Si hay una orden seleccionada, mostrar la vista de detalles
  if (selectedOrder) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <OrderDetailView
            order={selectedOrder}
            onBack={() => setSelectedOrder(null)}
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Título y contador */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('dashboard.panelTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {data?.pagination?.total ?? 0} {t('dashboard.ordersCount')}
          </p>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pestañas de estado */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-1">
            <button
              onClick={() => setStatusFilter('unscheduled')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                statusFilter === 'unscheduled'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {t('dashboard.unscheduled')}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                statusFilter === 'unscheduled'
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {stats.unscheduled}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                statusFilter === 'scheduled'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {t('dashboard.scheduled')}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                statusFilter === 'scheduled'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {stats.scheduled}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                statusFilter === 'success'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {t('dashboard.success')}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                statusFilter === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {stats.success}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('failure')}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                statusFilter === 'failure'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {t('dashboard.failure')}
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                statusFilter === 'failure'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
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
              {t('dashboard.loading')}
            </p>
          </div>
        )}

        {/* Estado de error */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : t('dashboard.error')}
            </p>
          </div>
        )}

        {/* Grid de órdenes */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {data?.orders?.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={() => {
                    setSelectedOrder(order)
                  }}
                />
              ))}
            </div>

            {/* Paginación */}
            {data?.pagination && (() => {
              const totalPages = Math.ceil(
                (data.pagination.total || 0) / Number(data.pagination.per_page)
              )
              const currentPageNum = Number(data.pagination.page)
              
              if (totalPages <= 1) return null
              
              return (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('dashboard.paginationInfo', {
                      page: currentPageNum,
                      totalPages: totalPages,
                      total: data.pagination.total || 0,
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPageNum === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('dashboard.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPageNum >= totalPages || isLoading}
                    >
                      {t('dashboard.next')}
                      <ChevronRight className="h-4 w-4 ml-1" />
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

