import { useAuthStore } from '@/features/auth/store'

export function getAuthHeaders(): HeadersInit {
  const accessToken = useAuthStore.getState().accessToken

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  return headers
}

