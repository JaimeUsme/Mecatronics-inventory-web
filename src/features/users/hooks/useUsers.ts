import { useQuery } from '@tanstack/react-query'
import { usersService } from '../services'
import type { GetUsersParams } from '../types'

export function useUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 30 * 1000, // 30 segundos
  })
}

