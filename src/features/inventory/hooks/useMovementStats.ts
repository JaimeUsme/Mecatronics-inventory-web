import { useQuery } from '@tanstack/react-query'
import { movementsService } from '../services/movements.service'

export function useMovementStats() {
  return useQuery({
    queryKey: ['movementStats'],
    queryFn: () => movementsService.getMovementStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

