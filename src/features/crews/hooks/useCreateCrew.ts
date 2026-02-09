import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'
import type { CreateCrewRequest, CrewResponse } from '../types'

export function useCreateCrew() {
  const queryClient = useQueryClient()

  return useMutation<CrewResponse, Error, CreateCrewRequest>({
    mutationFn: (payload) => crewsService.createCrew(payload),
    onSuccess: () => {
      // Invalidar la lista de cuadrillas para refrescar
      queryClient.invalidateQueries({ queryKey: ['crews'] })
    },
  })
}


