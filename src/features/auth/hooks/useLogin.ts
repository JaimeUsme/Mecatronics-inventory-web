import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services'
import { useAuthStore } from '../store'
import type { LoginRequest } from '../types'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Guardar accessToken en el store
      setAuth({
        accessToken: data.accessToken,
        isAuthenticated: true,
        company: 'wispro',
      })
      // Redirigir al dashboard o página principal
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Login error:', error)
      // El error ya se maneja en el componente con el mensaje del backend
    },
  })
}

