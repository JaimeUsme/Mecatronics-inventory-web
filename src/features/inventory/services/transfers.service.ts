import type { TransfersApiResponse, GetTransfersParams, TransferStats, TransferResponse } from '../types/transfers.types'
import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export const transfersService = {
  async getTransfers(params: GetTransfersParams = {}): Promise<TransfersApiResponse> {
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

    if (params.materialId) {
      queryParams.append('materialId', params.materialId)
    }

    if (params.technicianId) {
      queryParams.append('technicianId', params.technicianId)
    }

    if (params.dateFrom) {
      queryParams.append('dateFrom', params.dateFrom)
    }

    if (params.dateTo) {
      queryParams.append('dateTo', params.dateTo)
    }

    const url = `${API_BASE_URL}/inventory/transfers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener transferencias',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener transferencias'
      )
      error.status = response.status
      throw error
    }

    const data = await response.json()

    // El backend puede devolver directamente un array de transferencias
    if (Array.isArray(data)) {
      const transfers = data as TransferResponse[]
      return {
        transfers,
        pagination: {
          page: params.page ?? 1,
          per_page: params.per_page ?? transfers.length,
          total: transfers.length,
          total_pages: 1,
        },
      }
    }

    return data as TransfersApiResponse
  },

  async getTransferStats(): Promise<TransferStats> {
    const response = await fetch(`${API_BASE_URL}/inventory/transfers/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener estadísticas de transferencias',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener estadísticas de transferencias'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },
}

