import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { UpdateCrewRequest, CrewResponse } from '../types'

export function useUpdateCrew(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation<CrewResponse, Error, UpdateCrewRequest>({
    mutationFn: (payload) => crewsService.updateCrew(crewId, payload),
    onSuccess: () => {
      // Invalidar la lista de cuadrillas para refrescar
      queryClient.invalidateQueries({ queryKey: ['crews'] })
    },
  })
}

