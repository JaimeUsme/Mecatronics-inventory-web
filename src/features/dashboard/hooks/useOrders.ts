import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'
import { useAuthStore } from '@/features/auth/store'
import type { GetOrdersParams } from '../types'

export function useOrders(params: GetOrdersParams = {}) {
  const company = useAuthStore((state) => state.company)

  return useQuery({
    queryKey: ['orders', params.page, params.per_page, params.in_progress, params.scheduled, params.employee_id, params.completed, params.search, params.technicianId, params.fromDate, params.toDate],
    queryFn: () => ordersService.getOrders(params),
    enabled: company === 'wispro', // Solo ejecutar si es Wispro
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

