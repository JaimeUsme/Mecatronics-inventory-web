import { useQuery } from '@tanstack/react-query'
import { authService } from '../services'
import { useAuthStore } from '../store'

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const company = useAuthStore((state) => state.company)

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    // Solo ejecutar si está autenticado y es Mecatronics
    enabled: isAuthenticated && company === 'mecatronics',
    staleTime: 0, // Permitir refetch cuando se invalida
    gcTime: Infinity, // Mantener en cache indefinidamente hasta que se haga logout
    refetchOnMount: false, // No refetch al montar el componente
    refetchOnWindowFocus: false, // No refetch al enfocar la ventana
    refetchOnReconnect: false, // No refetch al reconectar
  })
}

