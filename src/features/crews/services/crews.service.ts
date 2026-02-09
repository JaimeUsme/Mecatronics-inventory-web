import type {
  CrewResponse,
  GetCrewsParams,
  CreateCrewRequest,
  UpdateCrewRequest,
  AddCrewMemberRequest,
  CrewMember,
} from '../types'
import type {
  ReconfigureCrewsRequest,
  ReconfigureCrewsResponse,
  ReconfigureCrewsPreviewResponse,
} from '../types/reconfigure.types'
import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export const crewsService = {
  async getCrews(params: GetCrewsParams = {}): Promise<CrewResponse[]> {
    const queryParams = new URLSearchParams()

    if (typeof params.active === 'boolean') {
      queryParams.append('active', String(params.active))
    }

    if (params.search) {
      queryParams.append('search', params.search)
    }

    const url = `${API_BASE_URL}/crews${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al obtener cuadrillas'
      )
      error.status = response.status
      throw error
    }

    return (data ?? []) as CrewResponse[]
  },

  async createCrew(payload: CreateCrewRequest): Promise<CrewResponse> {
    const response = await fetch(`${API_BASE_URL}/crews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al crear cuadrilla'
      )
      error.status = response.status
      throw error
    }

    return data as CrewResponse
  },

  async updateCrew(
    crewId: string,
    payload: UpdateCrewRequest
  ): Promise<CrewResponse> {
    const response = await fetch(`${API_BASE_URL}/crews/${crewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al actualizar cuadrilla'
      )
      error.status = response.status
      throw error
    }

    return data as CrewResponse
  },

  async addMember(
    crewId: string,
    payload: AddCrewMemberRequest
  ): Promise<CrewMember> {
    const response = await fetch(`${API_BASE_URL}/crews/${crewId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al agregar miembro a la cuadrilla'
      )
      error.status = response.status
      throw error
    }

    return data as CrewMember
  },

  async removeMember(crewId: string, memberId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/crews/${crewId}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    )

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        message: 'Error al quitar miembro de la cuadrilla',
      }))
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al quitar miembro de la cuadrilla'
      )
      error.status = response.status
      throw error
    }
  },

  async deleteCrew(crewId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/crews/${crewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        message: 'Error al eliminar cuadrilla',
      }))
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al eliminar cuadrilla'
      )
      error.status = response.status
      throw error
    }
  },

  async reconfigureCrewsPreview(
    payload: ReconfigureCrewsRequest
  ): Promise<ReconfigureCrewsPreviewResponse> {
    const response = await fetch(`${API_BASE_URL}/crews/reconfigure/preview`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al obtener preview de reconfiguración'
      )
      error.status = response.status
      throw error
    }

    return data as ReconfigureCrewsPreviewResponse
  },

  async reconfigureCrewsConfirm(
    payload: ReconfigureCrewsRequest
  ): Promise<ReconfigureCrewsResponse> {
    const response = await fetch(`${API_BASE_URL}/crews/reconfigure/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al confirmar reconfiguración de cuadrillas'
      )
      error.status = response.status
      throw error
    }

    return data as ReconfigureCrewsResponse
  },
}


