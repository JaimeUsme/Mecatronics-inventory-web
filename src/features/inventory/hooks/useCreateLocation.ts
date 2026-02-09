import { useMutation, useQueryClient } from '@tanstack/react-query'
import { locationsService } from '../services'
import type { LocationResponse } from '../types'
import type { CreateLocationRequest } from '../services/locations.service'

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation<LocationResponse, Error, CreateLocationRequest>({
    mutationFn: (payload) => locationsService.createLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}


