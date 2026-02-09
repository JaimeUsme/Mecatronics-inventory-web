import { useMutation, useQueryClient } from '@tanstack/react-query'
import { movementsService } from '../services/movements.service'
import type {
  CreateTransferRequest,
  CreateTransferResponse,
} from '../types/movements.types'

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation<CreateTransferResponse, Error, CreateTransferRequest>({
    mutationFn: (payload) => movementsService.createTransfer(payload),
    onSuccess: () => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['movementStats'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

