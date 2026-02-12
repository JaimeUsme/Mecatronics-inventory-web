import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services'
import type { UpdateUserRequest, UpdateUserResponse } from '../types'

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<
    UpdateUserResponse,
    Error,
    { userId: string; payload: UpdateUserRequest }
  >({
    mutationFn: ({ userId, payload }) =>
      usersService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

