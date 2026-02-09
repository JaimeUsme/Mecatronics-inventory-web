import { useQuery } from '@tanstack/react-query'
import { transfersService } from '../services/transfers.service'
import type { GetTransfersParams } from '../types/transfers.types'

export function useTransfers(params: GetTransfersParams = {}) {
  return useQuery({
    queryKey: ['transfers', params.page, params.per_page, params.search, params.materialId, params.technicianId, params.dateFrom, params.dateTo],
    queryFn: () => transfersService.getTransfers(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

