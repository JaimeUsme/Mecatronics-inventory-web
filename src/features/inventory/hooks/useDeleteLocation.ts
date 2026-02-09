import { useMutation, useQueryClient } from '@tanstack/react-query'
import { locationsService } from '../services'

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (locationId) => locationsService.deleteLocation(locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

