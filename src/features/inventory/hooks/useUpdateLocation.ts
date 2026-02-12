import { useMutation, useQueryClient } from '@tanstack/react-query'
import { locationsService } from '../services'
import type { LocationResponse } from '../types'
import type { UpdateLocationRequest } from '../services/locations.service'

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation<
    LocationResponse,
    Error,
    { locationId: string; payload: UpdateLocationRequest }
  >({
    mutationFn: ({ locationId, payload }) =>
      locationsService.updateLocation(locationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
  })
}

