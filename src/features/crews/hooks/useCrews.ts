import { useQuery } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { GetCrewsParams } from '../types'

export function useCrews(params: GetCrewsParams) {
  return useQuery({
    queryKey: ['crews', params],
    queryFn: () => crewsService.getCrews(params),
    staleTime: 5 * 60 * 1000,
  })
}


