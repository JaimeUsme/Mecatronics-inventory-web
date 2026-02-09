import { getAuthHeaders } from './api'
import { useSessionExpiredStore } from '@/shared/store/sessionExpiredStore'

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  // Si la respuesta es 401, activar el modal de sesión expirada
  if (response.status === 401) {
    useSessionExpiredStore.getState().setExpired(true)
  }

  return response
}

