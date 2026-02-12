import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services'
import type { CreateUserRequest, CreateUserResponse } from '../types'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: (payload) => usersService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

