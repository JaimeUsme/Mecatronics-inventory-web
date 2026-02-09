import { useQuery } from '@tanstack/react-query'
import { serviceOrdersService } from '../services/service-orders.service'
import type { GetServiceOrdersParams } from '../types'

export function useServiceOrders(params: GetServiceOrdersParams = {}) {
  return useQuery({
    queryKey: ['serviceOrders', params.page, params.per_page, params.search, params.technicianId, params.fromDate, params.toDate],
    queryFn: () => serviceOrdersService.getServiceOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

