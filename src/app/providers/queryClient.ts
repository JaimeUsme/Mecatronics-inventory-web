import { QueryClient } from '@tanstack/react-query'
import { useSessionExpiredStore } from '@/shared/store/sessionExpiredStore'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always', // Por defecto, refetch si está stale
      retry: (failureCount, error: any) => {
        // No reintentar si es un error 401 (token expirado)
        if (error?.status === 401 || error?.response?.status === 401) {
          useSessionExpiredStore.getState().setExpired(true)
          return false
        }
        return failureCount < 1
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: (_failureCount, error: any) => {
        // No reintentar si es un error 401 (token expirado)
        if (error?.status === 401 || error?.response?.status === 401) {
          useSessionExpiredStore.getState().setExpired(true)
          return false
        }
        return false // Las mutaciones normalmente no se reintentan
      },
    },
  },
})

