import { useQuery } from '@tanstack/react-query'
import { locationsService } from '../services'

export interface UseLocationsParams {
  type?: 'WAREHOUSE' | 'TECHNICIAN' | 'CREW'
  referenceId?: string
  active?: boolean
}

export function useLocations(params?: UseLocationsParams) {
  // Normalizar los parámetros para que la query key sea consistente
  const normalizedParams = params
    ? {
        ...params,
        // Asegurar que undefined no cause problemas en la query key
        active: params.active !== undefined ? params.active : undefined,
      }
    : undefined

  return useQuery({
    queryKey: ['locations', normalizedParams],
    queryFn: () => locationsService.getLocations(params),
    staleTime: 0, // Siempre considerar los datos como stale para que se refetch cuando cambien los parámetros
    refetchOnMount: true,
  })
}


