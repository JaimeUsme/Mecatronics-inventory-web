import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services'
import { useAuthStore } from '../store'
import type { AddWisproCredentialsRequest } from '../types'

export function useAddWisproCredentials() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: AddWisproCredentialsRequest) => 
      authService.addWisproCredentials(credentials),
    onSuccess: async (data) => {
      // Actualizar el token en el store
      const currentAuth = useAuthStore.getState()
      setAuth({
        accessToken: data.accessToken,
        isAuthenticated: currentAuth.isAuthenticated,
        company: currentAuth.company || 'mecatronics',
      })
      // Invalidar y refetch el perfil con el nuevo token
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.refetchQueries({ queryKey: ['profile'] })
      // Recargar la página para que se llamen nuevamente los endpoints necesarios
      window.location.reload()
    },
  })
}

