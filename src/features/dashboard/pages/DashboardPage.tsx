import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { DashboardLayout } from '@/shared/components/layout'
import { useDebounce } from '@/shared/hooks'
import { OrderCard } from '../components'
import { OrderDetailView } from '../components/OrderDetailView'
import { useOrders } from '../hooks'
import type { OrderResponse } from '../types'

export function DashboardPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  
  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  // Leer página de la URL
  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  }, [searchParams])
  
  // Leer employee_id de la URL
  const employeeId = useMemo(() => {
    const id = searchParams.get('employee_id') || undefined
    console.log('📋 Employee ID desde URL:', id)
    return id
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

  // Resetear a página 1 cuando cambia el filtro de estado
  useEffect(() => {
    if (currentPage !== 1) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)
        newParams.set('page', '1')
        return newParams
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  // Determinar filtros booleanos basados en statusFilter
  const inProgress = statusFilter === 'in_progress' ? true : undefined
  const scheduled = statusFilter === 'scheduled' ? true : undefined

  const { data, isLoading, isError, error } = useOrders({
    page: currentPage,
    per_page: perPage,
    in_progress: inProgress,
    scheduled: scheduled,
    employee_id: employeeId,
  })

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
        data.pagination.total / Number(data.pagination.per_page)
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

        {/* Búsqueda y filtros */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('dashboard.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('dashboard.pending')}</SelectItem>
              <SelectItem value="in_progress">{t('dashboard.inProgress')}</SelectItem>
              <SelectItem value="scheduled">{t('dashboard.scheduled')}</SelectItem>
            </SelectContent>
          </Select>
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
                data.pagination.total / Number(data.pagination.per_page)
              )
              const currentPageNum = Number(data.pagination.page)
              
              if (totalPages <= 1) return null
              
              return (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('dashboard.paginationInfo', {
                      page: currentPageNum,
                      totalPages: totalPages,
                      total: data.pagination.total,
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

