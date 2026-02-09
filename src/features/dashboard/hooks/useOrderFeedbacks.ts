import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'
import { useAuthStore } from '@/features/auth/store'

export function useOrderFeedbacks(orderId: string | undefined) {
  const company = useAuthStore((state) => state.company)

  return useQuery({
    queryKey: ['order-feedbacks', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required')
      return ordersService.getOrderFeedbacks(orderId)
    },
    enabled: (company === 'wispro' || company === 'mecatronics') && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

