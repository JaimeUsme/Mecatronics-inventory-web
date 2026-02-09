import { useQuery } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { ReconfigureCrewsRequest, ReconfigureCrewsPreviewResponse } from '../types/reconfigure.types'

export function useReconfigureCrewsPreview(
  payload: ReconfigureCrewsRequest | null,
  enabled: boolean = true
) {
  return useQuery<ReconfigureCrewsPreviewResponse, Error>({
    queryKey: ['crews', 'reconfigure', 'preview', payload],
    queryFn: () => crewsService.reconfigureCrewsPreview(payload!),
    enabled: enabled && payload !== null,
    staleTime: 0, // Siempre obtener datos frescos
  })
}

