import { useMutation, useQueryClient } from '@tanstack/react-query'
import { materialsService } from '../services'
import type { UpdateMaterialRequest, MaterialResponse } from '../types'

export function useUpdateMaterial() {
  const queryClient = useQueryClient()

  return useMutation<
    MaterialResponse,
    Error,
    { id: string; payload: UpdateMaterialRequest }
  >({
    mutationFn: ({ id, payload }) =>
      materialsService.updateMaterial(id, payload),
    onSuccess: () => {
      // Refrescar la lista de materiales
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}

