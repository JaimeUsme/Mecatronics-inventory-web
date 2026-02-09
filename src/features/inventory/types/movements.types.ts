export interface MovementResponse {
  id: string
  materialId: string
  materialName: string
  materialCategory: string
  materialUnit: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string | null
  toLocationName: string | null
  quantity: number
  type: 'TRANSFER' | 'CONSUMPTION' | 'DAMAGED' | 'ADJUSTMENT' | string
  serviceOrderId: string | null
  technicianId?: string
  createdAt: string
}

export interface MovementsApiResponse {
  movements: MovementResponse[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GetMovementsParams {
  page?: number
  per_page?: number
  materialId?: string
  locationId?: string
  fromLocationId?: string
  toLocationId?: string
  technicianId?: string
  type?: string
  fromDate?: string
  toDate?: string
}

export interface MovementStats {
  today: number
  thisWeek: number
  thisMonth: number
}

export interface CreateTransferRequest {
  materialId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  technicianId?: string
}

export interface CreateTransferResponse {
  id: string
  materialId: string
  materialName: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  quantity: number
  technicianId?: string
  createdAt: string
}

