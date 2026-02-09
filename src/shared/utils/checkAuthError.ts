import { useSessionExpiredStore } from '@/shared/store/sessionExpiredStore'

/**
 * Verifica si una respuesta es un error 401 (token expirado)
 * y activa el modal de sesión expirada si es necesario
 */
export function checkAuthError(response: Response): void {
  if (response.status === 401) {
    useSessionExpiredStore.getState().setExpired(true)
  }
}

