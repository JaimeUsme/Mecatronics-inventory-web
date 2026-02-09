import { useQuery } from '@tanstack/react-query'
import { transfersService } from '../services/transfers.service'

export function useTransferStats() {
  return useQuery({
    queryKey: ['transferStats'],
    queryFn: () => transfersService.getTransferStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

