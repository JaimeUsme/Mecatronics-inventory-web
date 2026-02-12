import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'
import { useAuthStore } from '@/features/auth/store'
import type { GetMyOrdersParams } from '../types'

export function useMyOrders(params: GetMyOrdersParams = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // Si es una consulta de contador (per_page: 1 y solo un filtro de estado), usar configuración diferente
  const isCountQuery = params.per_page === 1 && 
    !params.search && 
    (!params.page || params.page === 1) &&
    (params.unscheduled || params.scheduled_state || params.success || params.failure)

  return useQuery({
    queryKey: ['myOrders', params.page, params.per_page, params.search, params.unscheduled, params.scheduled_state, params.success, params.failure],
    queryFn: () => ordersService.getMyOrders(params),
    enabled: isAuthenticated,
    staleTime: isCountQuery ? Infinity : 10 * 60 * 1000, // Infinity para contadores (nunca se consideran stale), 10 minutos para consultas normales
    gcTime: 30 * 60 * 1000, // 30 minutes - mantener en cache más tiempo
    refetchOnMount: false, // No refetch en mount - usar caché si existe
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnReconnect: false, // No refetch al reconectar
  })
}

