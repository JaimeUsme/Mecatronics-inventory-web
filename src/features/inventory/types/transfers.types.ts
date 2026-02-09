export interface TransferResponse {
  id: string
  materialId: string
  materialName: string
  materialCategory: string
  quantity: number
  unit: string
  fromLocationId: string
  fromLocationName: string
  fromLocationType: 'WAREHOUSE' | 'TECHNICIAN'
  toLocationId: string
  toLocationName: string
  toLocationType: 'WAREHOUSE' | 'TECHNICIAN'
  technicianId?: string
  technicianName?: string
  technicianEmail?: string
  transferredAt: string
  createdAt: string
}

export interface TransfersApiResponse {
  transfers: TransferResponse[]
  pagination?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GetTransfersParams {
  page?: number
  per_page?: number
  search?: string
  materialId?: string
  technicianId?: string
  dateFrom?: string
  dateTo?: string
}

export interface TransferStats {
  today: number
  thisWeek: number
  thisMonth: number
}

