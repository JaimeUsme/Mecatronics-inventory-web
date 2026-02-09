export interface ServiceOrderResponse {
  id: string
  code: string
  state: 'pending' | 'in_progress' | 'closed' | 'cancelled'
  description: string
  client_name: string
  technician_name: string
  created_at: string
  closed_at?: string
}

export interface ServiceOrdersApiResponse {
  orders: ServiceOrderResponse[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GetServiceOrdersParams {
  page?: number
  per_page?: number
  search?: string
  technicianId?: string
  fromDate?: string
  toDate?: string
}

