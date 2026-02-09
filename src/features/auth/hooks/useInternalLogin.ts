import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services'
import { useAuthStore } from '../store'
import type { LoginRequest } from '../types'

export function useInternalLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.internalLogin(credentials),
    onSuccess: async (data) => {
      if (data.accessToken) {
        setAuth({
          accessToken: data.accessToken,
          isAuthenticated: true,
          company: 'mecatronics',
        })
        // Fetch el profile inmediatamente después del login
        // Pasamos el token directamente para asegurar que esté disponible
        try {
          console.log('Fetching profile after login...')
          const profile = await authService.getProfile(data.accessToken)
          console.log('Profile fetched:', profile)
          // Guardar el profile en el cache de React Query
          queryClient.setQueryData(['profile'], profile)
        } catch (error) {
          console.error('Error fetching profile after login:', error)
        }
        navigate('/dashboard')
      }
    },
    onError: (error) => {
      console.error('Internal login error:', error)
    },
  })
}


