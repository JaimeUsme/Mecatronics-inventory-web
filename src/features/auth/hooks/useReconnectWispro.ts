import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services'
import { useAuthStore } from '../store'

export function useReconnectWispro() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.reconnectWispro(),
    onSuccess: async (data) => {
      // Solo actualizar el token si la reconexión fue exitosa y hay un token
      if (data.success && data.accessToken) {
        const currentAuth = useAuthStore.getState()
        setAuth({
          accessToken: data.accessToken,
          isAuthenticated: currentAuth.isAuthenticated,
          company: currentAuth.company || 'mecatronics',
        })
        // Invalidar y refetch el perfil con el nuevo token
        await queryClient.invalidateQueries({ queryKey: ['profile'] })
        // Forzar refetch del perfil para actualizar el estado de conexión
        await queryClient.refetchQueries({ queryKey: ['profile'] })
      }
    },
  })
}

