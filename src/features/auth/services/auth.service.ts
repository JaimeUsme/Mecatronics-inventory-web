import type {
  LoginRequest,
  LoginResponse,
  LoginErrorResponse,
  CurrentUser,
  ProfileResponse,
  ReconnectWisproResponse,
  AddWisproCredentialsRequest,
  AddWisproCredentialsResponse,
} from '../types'
import { getAuthHeaders } from '@/shared/utils/api'
import { checkAuthError } from '@/shared/utils/checkAuthError'
import { API_BASE_URL } from '@/shared/constants'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Importante para recibir cookies
    })

    const data = await response.json()

    // Si la respuesta tiene statusCode, es un error
    if ('statusCode' in data) {
      const errorData = data as LoginErrorResponse
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al iniciar sesión'
      )
      error.status = errorData.statusCode
      throw error
    }

    // Si no tiene statusCode, es una respuesta exitosa
    return data as LoginResponse
  },

  async internalLogin(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/internal-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    })

    const data = await response.json()

    if ('statusCode' in data) {
      const errorData = data as LoginErrorResponse
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al iniciar sesión'
      )
      error.status = errorData.statusCode
      throw error
    }

    return data as LoginResponse
  },

  async getCurrentUser(): Promise<CurrentUser> {
    const response = await fetch(`${API_BASE_URL}/users/current`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener información del usuario',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener información del usuario'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async getProfile(accessToken?: string): Promise<ProfileResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Si se pasa un token, usarlo directamente; si no, usar getAuthHeaders()
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    } else {
      const authHeaders = getAuthHeaders()
      Object.assign(headers, authHeaders)
    }

    console.log('Calling GET /auth/profile with token:', accessToken ? 'provided' : 'from store')

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener perfil del usuario',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener perfil del usuario'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async reconnectWispro(): Promise<ReconnectWisproResponse> {
    const response = await fetch(`${API_BASE_URL}/internal-auth/reconnect-wispro`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al reconectar con Wispro',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al reconectar con Wispro'
      )
      error.status = response.status
      throw error
    }

    const data = await response.json()
    
    // Si la respuesta es exitosa pero success es false, lanzar un error
    if (!data.success || !data.accessToken) {
      const error: Error & { status?: number } = new Error(
        data.message || 'No se pudo reconectar con Wispro'
      )
      error.status = 400
      throw error
    }

    return data
  },

  async addWisproCredentials(credentials: AddWisproCredentialsRequest): Promise<AddWisproCredentialsResponse> {
    const response = await fetch(`${API_BASE_URL}/internal-auth/add-wispro-credentials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al agregar credenciales de Wispro',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al agregar credenciales de Wispro'
      )
      error.status = response.status
      throw error
    }

    const data = await response.json()
    
    // Si la respuesta es exitosa pero success es false, lanzar un error
    if (!data.success || !data.accessToken) {
      const error: Error & { status?: number } = new Error(
        data.message || 'No se pudieron agregar las credenciales de Wispro'
      )
      error.status = 400
      throw error
    }

    return data
  },
}

