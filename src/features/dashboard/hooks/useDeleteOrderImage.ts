import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services'

export function useDeleteOrderImage(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => ordersService.deleteOrderImage(orderId, imageId),
    onSuccess: (data) => {
      // Actualizar la caché con la nueva lista de imágenes
      queryClient.setQueryData(['order-images', orderId], data)
    },
  })
}

