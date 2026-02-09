import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services'
import { useAuthStore } from '../store'

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const company = useAuthStore((state) => state.company)
  const queryClient = useQueryClient()

  // Verificar si ya hay datos en cache
  const cachedProfile = queryClient.getQueryData(['profile'])

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    // Solo ejecutar si está autenticado, es Mecatronics Y no hay datos en cache
    // Esto evita que se llame en cada recarga si ya hay datos
    enabled: isAuthenticated && company === 'mecatronics' && !cachedProfile,
    staleTime: Infinity, // Los datos nunca se consideran "stale" - solo se actualizan después del login
    gcTime: Infinity, // Mantener en cache indefinidamente hasta que se haga logout
    refetchOnMount: false, // No refetch al montar el componente
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnReconnect: false, // No refetch al reconectar
  })
}

