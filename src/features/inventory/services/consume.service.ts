import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export interface ConsumeMaterial {
  materialId: string
  materialName: string
  materialUnit: string
  quantityUsed: number
  quantityDamaged: number
}

export interface ConsumeMaterialsRequest {
  materials: ConsumeMaterial[]
  serviceOrderId: string
}

export interface ConsumeMaterialsResponse {
  success: boolean
  message?: string
}

export const consumeService = {
  async consumeMaterials(
    payload: ConsumeMaterialsRequest
  ): Promise<ConsumeMaterialsResponse> {
    const response = await fetch(`${API_BASE_URL}/inventory/consume-materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al consumir materiales',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al consumir materiales'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },
}

