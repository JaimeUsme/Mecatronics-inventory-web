import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'
import { useAuthStore } from '@/features/auth/store'

export function useMyOrderCounts(search?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['myOrderCounts', search],
    queryFn: () => ordersService.getMyOrderCounts(search),
    enabled: isAuthenticated,
    staleTime: Infinity, // Los contadores nunca se consideran stale
    gcTime: 30 * 60 * 1000, // 30 minutes - mantener en cache más tiempo
    refetchOnMount: false, // No refetch en mount - usar caché si existe
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnReconnect: false, // No refetch al reconectar
  })
}

