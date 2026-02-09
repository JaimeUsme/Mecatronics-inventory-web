import { useMutation, useQueryClient } from '@tanstack/react-query'
import { consumeService } from '../services/consume.service'
import type { ConsumeMaterialsRequest, ConsumeMaterialsResponse } from '../services/consume.service'

export function useConsumeMaterials() {
  const queryClient = useQueryClient()

  return useMutation<ConsumeMaterialsResponse, Error, ConsumeMaterialsRequest>({
    mutationFn: (payload) => consumeService.consumeMaterials(payload),
    onSuccess: () => {
      // Invalidar las queries relacionadas con inventario para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['stock'] })
    },
  })
}

