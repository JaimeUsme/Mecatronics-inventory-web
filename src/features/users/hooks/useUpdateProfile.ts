import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services'
import type { UpdateProfileRequest, UpdateProfileResponse } from '../types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation<UpdateProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: (payload) => usersService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

