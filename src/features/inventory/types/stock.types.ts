// Respuesta del API
export interface StockItemApi {
  materialId: string
  materialName: string
  materialCategory: string
  materialImages: string[] | null
  unit: string
  stock: number
  minStock: number | null
  locationId: string
  locationName: string
  locationType: 'WAREHOUSE' | 'TECHNICIAN'
  locationReferenceId: string | null
  lastUpdated: string
}

export interface StockApiResponse {
  items: StockItemApi[]
}

// Item procesado para la UI
export interface StockItem {
  id: string // materialId + locationId para identificar únicamente
  materialId: string
  materialName: string
  materialCategory: string
  materialImages: string[] | null
  locationId: string
  locationName: string
  locationType: 'WAREHOUSE' | 'TECHNICIAN'
  currentStock: number
  minStock: number | null
  unit: string
  status: 'normal' | 'low' | 'out'
  lastUpdated: string
}

export interface GetStockParams {
  type?: 'warehouse' | 'technician'
  locationId?: string
  category?: string
  stockStatus?: 'low' | 'normal' | 'out_of_stock'
  search?: string
}

export interface StockStats {
  totalMaterials: number
  totalLocations: number
  lowStockCount: number
  warehouseOutOfStockCount: number
}

