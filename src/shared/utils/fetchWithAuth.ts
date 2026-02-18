import { getAuthHeaders } from './api'
import { useSessionExpiredStore } from '@/shared/store/sessionExpiredStore'

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = getAuthHeaders() as Record<string, string>
  const optionsHeaders = (options.headers ?? {}) as Record<string, string>
  const headers: Record<string, string> = { ...authHeaders, ...optionsHeaders }

  // Con FormData no se debe enviar Content-Type; el navegador lo pone con el boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
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

