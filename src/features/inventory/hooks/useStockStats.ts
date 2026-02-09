import { useQuery } from '@tanstack/react-query'
import { stockService } from '../services/stock.service'

export function useStockStats() {
  return useQuery({
    queryKey: ['stockStats'],
    queryFn: () => stockService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

