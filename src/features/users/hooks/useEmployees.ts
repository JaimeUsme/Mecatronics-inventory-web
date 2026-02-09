import { useQuery } from '@tanstack/react-query'
import { employeesService } from '../services'
import type { GetEmployeesParams } from '../types'

export function useEmployees(params: GetEmployeesParams = {}) {
  return useQuery({
    queryKey: ['employees', params.page, params.per_page, params.search],
    queryFn: () => employeesService.getEmployees(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

