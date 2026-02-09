import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { ReconfigureCrewsRequest, ReconfigureCrewsResponse } from '../types/reconfigure.types'

export function useReconfigureCrews() {
  const queryClient = useQueryClient()

  return useMutation<ReconfigureCrewsResponse, Error, ReconfigureCrewsRequest>({
    mutationFn: (payload) => crewsService.reconfigureCrewsConfirm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crews'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['crews', 'reconfigure', 'preview'] })
    },
  })
}

