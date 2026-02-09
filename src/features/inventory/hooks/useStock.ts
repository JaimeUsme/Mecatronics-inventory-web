import { useQuery } from '@tanstack/react-query'
import { stockService } from '../services/stock.service'
import type { GetStockParams } from '../types/stock.types'

export function useStock(params: GetStockParams = {}) {
  return useQuery({
    queryKey: ['stock', params.type, params.locationId, params.category, params.stockStatus, params.search],
    queryFn: () => stockService.getStock(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

