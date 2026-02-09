import { useQuery } from '@tanstack/react-query'
import { movementsService } from '../services/movements.service'
import type { GetMovementsParams } from '../types/movements.types'

export function useMovements(params: GetMovementsParams = {}) {
  return useQuery({
    queryKey: [
      'movements',
      params.page,
      params.per_page,
      params.materialId,
      params.locationId,
      params.fromLocationId,
      params.toLocationId,
      params.technicianId,
      params.type,
      params.fromDate,
      params.toDate,
    ],
    queryFn: () => movementsService.getMovements(params),
    staleTime: 0, // Siempre considerar los datos como stale para que se refetch cuando cambien los parámetros
    refetchOnMount: true,
  })
}

