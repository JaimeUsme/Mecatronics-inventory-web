import { useQuery } from '@tanstack/react-query'
import { materialsService } from '../services'
import type { GetMaterialsParams } from '../types'

export function useMaterials(params: GetMaterialsParams = {}) {
  return useQuery({
    queryKey: ['materials', params.page, params.per_page, params.search],
    queryFn: () => materialsService.getMaterials(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


