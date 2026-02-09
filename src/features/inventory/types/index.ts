export interface CreateMaterialRequest {
  name: string
  unit: string
  category?: string
  minStock?: number
}

export interface MaterialResponse {
  id: string
  name: string
  unit: string
  minStock: number
  category: string
  images: string[] | null
  ownershipType: 'CREW' | 'TECHNICIAN'
  createdAt?: string
}

export interface MaterialsApiResponse {
  materials: MaterialResponse[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GetMaterialsParams {
  page?: number
  per_page?: number
  search?: string
}

export type LocationTypeApi = 'WAREHOUSE' | 'TECHNICIAN' | 'CREW'

export interface LocationResponse {
  id: string
  type: LocationTypeApi
  referenceId: string | null
  name: string
  active: boolean
  createdAt: string
}


