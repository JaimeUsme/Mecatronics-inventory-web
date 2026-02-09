import type {
  CreateMaterialRequest,
  MaterialResponse,
  GetMaterialsParams,
  MaterialsApiResponse,
} from '../types'
import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export const materialsService = {
  async createMaterial(payload: CreateMaterialRequest): Promise<MaterialResponse> {
    const response = await fetch(`${API_BASE_URL}/inventory/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al crear material'
      )
      error.status = response.status
      throw error
    }

    return data as MaterialResponse
  },

  async getMaterials(params: GetMaterialsParams = {}): Promise<MaterialsApiResponse> {
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

    const url = `${API_BASE_URL}/inventory/materials${
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
        data?.message || 'Error al obtener materiales'
      )
      error.status = response.status
      throw error
    }

    // El backend puede devolver directamente un array de materiales
    if (Array.isArray(data)) {
      const materials = data as MaterialResponse[]
      return {
        materials,
        pagination: {
          page: params.page ?? 1,
          per_page: params.per_page ?? materials.length,
          total: materials.length,
          total_pages: 1,
        },
      }
    }

    return data as MaterialsApiResponse
  },
}


