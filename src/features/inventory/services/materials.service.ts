import type {
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialResponse,
  GetMaterialsParams,
  MaterialsApiResponse,
} from '../types'
import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export const materialsService = {
  async createMaterial(payload: CreateMaterialRequest): Promise<MaterialResponse> {
    // Crear FormData para multipart/form-data
    const formData = new FormData()
    
    formData.append('name', payload.name)
    formData.append('unit', payload.unit)
    
    if (payload.category) {
      formData.append('category', payload.category)
    }
    
    if (payload.minStock !== undefined) {
      formData.append('minStock', payload.minStock.toString())
    }
    
    if (payload.ownershipType) {
      formData.append('ownershipType', payload.ownershipType)
    }
    
    // Agregar imágenes si existen
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    // Obtener headers de autenticación (sin Content-Type para que el navegador lo establezca automáticamente con el boundary)
    const authHeaders = getAuthHeaders()
    const headers: HeadersInit = {}
    
    // Copiar headers de autenticación excepto Content-Type
    Object.entries(authHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = value
      }
    })

    const response = await fetch(`${API_BASE_URL}/inventory/materials`, {
      method: 'POST',
      headers,
      body: formData,
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

  async updateMaterial(
    id: string,
    payload: UpdateMaterialRequest
  ): Promise<MaterialResponse> {
    // Crear FormData para multipart/form-data
    const formData = new FormData()
    
    if (payload.name) {
      formData.append('name', payload.name)
    }
    
    if (payload.unit) {
      formData.append('unit', payload.unit)
    }
    
    if (payload.category) {
      formData.append('category', payload.category)
    }
    
    if (payload.minStock !== undefined) {
      formData.append('minStock', payload.minStock.toString())
    }
    
    if (payload.ownershipType) {
      formData.append('ownershipType', payload.ownershipType)
    }
    
    // Agregar imágenes si existen
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    // Obtener headers de autenticación (sin Content-Type para que el navegador lo establezca automáticamente con el boundary)
    const authHeaders = getAuthHeaders()
    const headers: HeadersInit = {}
    
    // Copiar headers de autenticación excepto Content-Type
    Object.entries(authHeaders).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') {
        headers[key] = value
      }
    })

    const response = await fetch(`${API_BASE_URL}/inventory/materials/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      const error: Error & { status?: number } = new Error(
        data?.message || 'Error al actualizar material'
      )
      error.status = response.status
      throw error
    }

    return data as MaterialResponse
  },
}


