import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsService } from '../services/crews.service'

export function useDeleteCrew() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (crewId) => crewsService.deleteCrew(crewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crews'] })
    },
  })
}

