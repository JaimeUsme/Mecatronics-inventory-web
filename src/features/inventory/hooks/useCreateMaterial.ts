import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialsService } from '../services'
import type { CreateMaterialRequest, MaterialResponse } from '../types'

export function useCreateMaterial() {
  const queryClient = useQueryClient()

  return useMutation<MaterialResponse, Error, CreateMaterialRequest>({
    mutationFn: (payload) => materialsService.createMaterial(payload),
    onSuccess: () => {
      // Refrescar la lista de materiales
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}


