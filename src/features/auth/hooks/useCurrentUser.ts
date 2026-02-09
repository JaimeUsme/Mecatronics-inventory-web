import { useQuery } from '@tanstack/react-query'
import { authService } from '../services'
import { useAuthStore } from '../store'

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const company = useAuthStore((state) => state.company)

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    // Solo llamar a /users/current cuando es sesión de Wispro
    enabled: isAuthenticated && company === 'wispro',
    staleTime: 10 * 60 * 1000, // 10 minutos - la información del usuario no cambia frecuentemente
    gcTime: 30 * 60 * 1000, // 30 minutos en cache
  })
}

