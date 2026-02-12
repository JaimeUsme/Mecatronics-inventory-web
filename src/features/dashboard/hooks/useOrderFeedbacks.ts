import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'

export function useOrderFeedbacks(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order-feedbacks', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required')
      return ordersService.getOrderFeedbacks(orderId)
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

