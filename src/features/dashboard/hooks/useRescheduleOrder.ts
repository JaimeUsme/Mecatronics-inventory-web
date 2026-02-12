import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services'

export function useRescheduleOrder(orderId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (feedbackBody: string) => ordersService.rescheduleOrder(orderId, feedbackBody),
    onSuccess: () => {
      // Invalidar las queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['myOrders'] })
      queryClient.invalidateQueries({ queryKey: ['order-feedbacks', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orderCounts'] })
      queryClient.invalidateQueries({ queryKey: ['myOrderCounts'] })
    },
  })
}

