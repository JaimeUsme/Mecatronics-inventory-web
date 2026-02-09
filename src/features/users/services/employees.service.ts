import type { EmployeesApiResponse, GetEmployeesParams } from '../types'
import { getAuthHeaders } from '@/shared/utils/api'

const API_BASE_URL = 'http://localhost:3000'

export const employeesService = {
  async getEmployees(params: GetEmployeesParams = {}): Promise<EmployeesApiResponse> {
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

    if (params.role_name && params.role_name.trim()) {
      queryParams.append('role_name', params.role_name.trim())
    }

    const url = `${API_BASE_URL}/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Error al obtener empleados',
      }))
      const error: Error & { status?: number } = new Error(
        errorData.message || 'Error al obtener empleados'
      )
      error.status = response.status
      throw error
    }

    return response.json()
  },
}

