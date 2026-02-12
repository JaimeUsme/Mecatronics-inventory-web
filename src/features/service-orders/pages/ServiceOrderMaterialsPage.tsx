import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
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
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useQuery } from '@tanstack/react-query'
import { ordersService } from '@/features/dashboard/services'
import { useTechnicians } from '@/features/users/hooks'
import { useDebounce } from '@/shared/hooks'
import { ServiceOrderCard } from '../components/ServiceOrderCard'
import { ServiceOrderDetailView } from '../components/ServiceOrderDetailView'
import { cn } from '@/shared/utils'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import type { EmployeeResponse } from '@/features/users/types'
import type { GetOrdersParams, OrderResponse } from '@/features/dashboard/types'

export function ServiceOrderMaterialsPage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [technicianFilter, setTechnicianFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)

  // Estados para los filtros aplicados
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedTechnicianFilter, setAppliedTechnicianFilter] = useState<string>('all')
  const [appliedDateFrom, setAppliedDateFrom] = useState<Date | undefined>(undefined)
  const [appliedDateTo, setAppliedDateTo] = useState<Date | undefined>(undefined)

  const debouncedSearch = useDebounce(appliedSearch, 500)

  const [technicianSearch, setTechnicianSearch] = useState('')
  const debouncedTechnicianSearch = useDebounce(technicianSearch, 400)
  const techniciansQuery = useTechnicians(debouncedTechnicianSearch) as any
  const technicians =
    techniciansQuery.data?.pages.flatMap(
      (page: { employees: any[] }) => page.employees
    ) ?? []

  const { data: ordersData, isLoading, isError, error } = useQuery({
    queryKey: ['orders', currentPage, 20, undefined, undefined, undefined, true, debouncedSearch || undefined, appliedTechnicianFilter !== 'all' ? appliedTechnicianFilter : undefined, appliedDateFrom ? format(appliedDateFrom, 'yyyy-MM-dd') : undefined, appliedDateTo ? format(appliedDateTo, 'yyyy-MM-dd') : undefined],
    queryFn: () => ordersService.getOrders({
      page: currentPage,
      per_page: 20,
      completed: true,
      search: debouncedSearch || undefined,
      technicianId: appliedTechnicianFilter !== 'all' ? appliedTechnicianFilter : undefined,
      fromDate: appliedDateFrom ? format(appliedDateFrom, 'yyyy-MM-dd') : undefined,
      toDate: appliedDateTo ? format(appliedDateTo, 'yyyy-MM-dd') : undefined,
    } as GetOrdersParams),
    staleTime: 5 * 60 * 1000,
  })

  const orders = ordersData?.orders ?? []

  const handleSearch = () => {
    setAppliedSearch(search)
    setAppliedTechnicianFilter(technicianFilter)
    setAppliedDateFrom(dateFrom)
    setAppliedDateTo(dateTo)
    setCurrentPage(1) // Resetear a página 1 al buscar
  }

  const handleClearFilters = () => {
    setSearch('')
    setTechnicianFilter('all')
    setDateFrom(undefined)
    setDateTo(undefined)
    setTechnicianSearch('')
    // También limpiar los filtros aplicados
    setAppliedSearch('')
    setAppliedTechnicianFilter('all')
    setAppliedDateFrom(undefined)
    setAppliedDateTo(undefined)
    setCurrentPage(1) // Resetear a página 1 al limpiar
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (ordersData?.pagination) {
      const totalPages = Math.ceil(
        (ordersData.pagination.total || 0) / Number(ordersData.pagination.per_page)
      )
      if (currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const dateLocale = i18n.language === 'es' ? es : enUS

  // Si hay una orden seleccionada, mostrar la vista de detalle
  if (selectedOrder) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('serviceOrders.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('serviceOrders.description')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('serviceOrders.searchPlaceholder')}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-wrap">
              {/* Technician Filter */}
              <div className="w-full lg:w-56">
                <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('serviceOrders.filters.selectTechnician')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('serviceOrders.filters.allTechnicians')}</SelectItem>
                    {technicians.map((tech: EmployeeResponse) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
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
                        <span>{t('serviceOrders.filters.dateFrom') || 'Desde'}</span>
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
                        <span>{t('serviceOrders.filters.dateTo') || 'Hasta'}</span>
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

              <Button
                onClick={handleSearch}
                className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                {t('serviceOrders.search') || 'Buscar'}
              </Button>
              <Button variant="outline" onClick={handleClearFilters} className="w-full lg:w-auto">
                <X className="h-4 w-4 mr-2" />
                {t('serviceOrders.clearFilters')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders List */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{t('serviceOrders.loading')}</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : t('serviceOrders.error')}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">{t('serviceOrders.noOrders')}</p>
                </div>
              ) : (
                orders.map((order) => (
                  <ServiceOrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))
              )}
            </div>

            {/* Paginación */}
            {ordersData?.pagination && (() => {
              const totalPages = Math.ceil(
                (ordersData.pagination.total || 0) / Number(ordersData.pagination.per_page)
              )
              const currentPageNum = Number(ordersData.pagination.page) || currentPage
              
              if (totalPages <= 1) return null
              
              return (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('serviceOrders.paginationInfo', {
                      page: currentPageNum,
                      totalPages: totalPages,
                      total: ordersData.pagination.total,
                    }) || `Página ${currentPageNum} de ${totalPages} (${ordersData.pagination.total} órdenes)`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPageNum === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t('serviceOrders.previous') || 'Anterior'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPageNum >= totalPages || isLoading}
                    >
                      {t('serviceOrders.next') || 'Siguiente'}
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

