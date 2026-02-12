import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services'
import type { GetOrderImagesResponse } from '../types'

export function useUploadOrderImage(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation<GetOrderImagesResponse, Error, File>({
    mutationFn: (file) => ordersService.uploadOrderImage(orderId, file),
    onSuccess: (data) => {
      // Actualizar el cache con todas las imágenes (incluyendo la nueva)
      queryClient.setQueryData(['order-images', orderId], data)
    },
  })
}

