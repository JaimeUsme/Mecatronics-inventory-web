import type {
  UsersApiResponse,
  GetUsersParams,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types'
import { getAuthHeaders } from '@/shared/utils/api'
import { checkAuthError } from '@/shared/utils/checkAuthError'

const API_BASE_URL = 'http://localhost:3000'

export const usersService = {
  async getUsers(params: GetUsersParams = {}): Promise<UsersApiResponse> {
    const queryParams = new URLSearchParams()

    if (params.page) {
      queryParams.append('page', params.page.toString())
    }

    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }

    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim())
    }

    if (params.active !== undefined) {
      queryParams.append('active', params.active.toString())
    }

    const url = `${API_BASE_URL}/internal-auth/users${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    checkAuthError(response)

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al obtener usuarios'
      )
      error.status = response.status
      throw error
    }

    return data as UsersApiResponse
  },

  async createUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await fetch(`${API_BASE_URL}/internal-auth/register`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    checkAuthError(response)

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al crear usuario'
      )
      error.status = response.status
      throw error
    }

    return data as CreateUserResponse
  },

  async updateUser(
    userId: string,
    payload: UpdateUserRequest
  ): Promise<UpdateUserResponse> {
    const response = await fetch(
      `${API_BASE_URL}/internal-auth/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      }
    )

    checkAuthError(response)

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al actualizar usuario'
      )
      error.status = response.status
      throw error
    }

    return data as UpdateUserResponse
  },

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/internal-auth/users/${userId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    )

    checkAuthError(response)

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al eliminar usuario'
      )
      error.status = response.status
      throw error
    }
  },

  async updateProfile(
    payload: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/internal-auth/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    checkAuthError(response)

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al actualizar perfil'
      )
      error.status = response.status
      throw error
    }

    return data as UpdateProfileResponse
  },
}

