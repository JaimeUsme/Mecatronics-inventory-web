import type { LocationResponse } from '../types'
import { getAuthHeaders } from '@/shared/utils/api'

import { API_BASE_URL } from '@/shared/constants'

export interface CreateLocationRequest {
  type: 'WAREHOUSE' | 'TECHNICIAN'
  name: string
  referenceId?: string
}

export interface UpdateLocationRequest {
  name?: string
  active?: boolean
}

export const locationsService = {
  async createLocation(payload: CreateLocationRequest): Promise<LocationResponse> {
    const response = await fetch(`${API_BASE_URL}/inventory/locations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al crear ubicación'
      )
      error.status = response.status
      throw error
    }

    return data as LocationResponse
  },

  async getLocations(params?: {
    type?: 'WAREHOUSE' | 'TECHNICIAN' | 'CREW'
    referenceId?: string
    active?: boolean
  }): Promise<LocationResponse[]> {
    const queryParams = new URLSearchParams()

    if (params?.type) {
      queryParams.append('type', params.type)
    }

    if (params?.referenceId) {
      queryParams.append('referenceId', params.referenceId)
    }

    if (params?.active !== undefined) {
      queryParams.append('active', params.active.toString())
    }

    const url = `${API_BASE_URL}/inventory/locations${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al obtener ubicaciones'
      )
      error.status = response.status
      throw error
    }

    return data as LocationResponse[]
  },

  async updateLocation(
    locationId: string,
    payload: UpdateLocationRequest
  ): Promise<LocationResponse> {
    const response = await fetch(`${API_BASE_URL}/inventory/locations/${locationId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al actualizar ubicación'
      )
      error.status = response.status
      throw error
    }

    return data as LocationResponse
  },

  async deleteLocation(locationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/inventory/locations/${locationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        message: 'Error al eliminar ubicación',
      }))
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al eliminar ubicación'
      )
      error.status = response.status
      throw error
    }
  },
}


