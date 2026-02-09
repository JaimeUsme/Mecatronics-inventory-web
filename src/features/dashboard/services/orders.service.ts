import type { OrdersApiResponse, GetOrdersParams, OrderImage, OrderFeedback, CreateFeedbackRequest } from '../types'
import { getAuthHeaders } from '@/shared/utils/api'
import { checkAuthError } from '@/shared/utils/checkAuthError'

const API_BASE_URL = 'http://localhost:3000'

export const ordersService = {
  async getOrders(params: GetOrdersParams = {}): Promise<OrdersApiResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }
    
    if (params.per_page) {
      queryParams.append('per_page', params.per_page.toString())
    }
    
    if (params.in_progress !== undefined) {
      queryParams.append('in_progress', params.in_progress.toString())
    }
    
    if (params.scheduled !== undefined) {
      queryParams.append('scheduled', params.scheduled.toString())
    }
    
    if (params.employee_id) {
      queryParams.append('employee_id', params.employee_id)
    }

    if (params.completed !== undefined) {
      queryParams.append('completed', params.completed.toString())
    }

    if (params.search) {
      queryParams.append('search', params.search.trim())
    }

    if (params.technicianId) {
      queryParams.append('technicianId', params.technicianId)
    }

    if (params.fromDate) {
      queryParams.append('fromDate', params.fromDate)
    }

    if (params.toDate) {
      queryParams.append('toDate', params.toDate)
    }

    const url = `${API_BASE_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    console.log('🔍 Buscando órdenes con:', {
      url,
      employee_id: params.employee_id,
      params: Object.fromEntries(queryParams.entries())
    })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener órdenes',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener órdenes'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async getOrderImages(orderId: string): Promise<OrderImage[]> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/images`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener las imágenes de la orden',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener las imágenes de la orden'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async uploadOrderImage(orderId: string, file: File): Promise<OrderImage[]> {
    const formData = new FormData()
    formData.append('file[]', file)

    const authHeaders = getAuthHeaders()
    // Crear headers sin Content-Type para multipart/form-data
    // El navegador establecerá automáticamente el Content-Type con el boundary correcto
    const headers: Record<string, string> = {}
    const authHeaderValue = Array.isArray(authHeaders)
      ? authHeaders.find(([key]) => key.toLowerCase() === 'authorization')?.[1]
      : (authHeaders as Record<string, string>)['Authorization']
    
    if (authHeaderValue) {
      headers['Authorization'] = authHeaderValue
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/images`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    })

    // Aceptar tanto 200 OK como 201 Created como códigos de éxito
    if (!response.ok && response.status !== 201) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al subir la imagen',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al subir la imagen'
      )
      error.status = response.status
      throw error
    }

    // Manejar respuestas vacías
    const text = await response.text()
    if (!text || text.trim() === '') {
      // Si la respuesta está vacía, devolver array vacío o recargar las imágenes
      return []
    }

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error('Error al parsear respuesta de subida de imagen:', parseError)
      throw new Error('Error al procesar la respuesta del servidor')
    }
  },

  async getOrderFeedbacks(orderId: string): Promise<OrderFeedback[]> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/feedbacks`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener los feedbacks de la orden',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener los feedbacks de la orden'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async createOrderFeedback(orderId: string, payload: CreateFeedbackRequest): Promise<OrderFeedback[]> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/feedbacks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al crear el feedback',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al crear el feedback'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },

  async deleteOrderImage(orderId: string, imageId: string): Promise<OrderImage[]> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      checkAuthError(response)
      const errorData = await response.json().catch(() => ({
        message: 'Error al eliminar la imagen',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al eliminar la imagen'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },
}

