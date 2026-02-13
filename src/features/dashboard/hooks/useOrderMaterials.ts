import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../services'

export function useOrderMaterials(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order-materials', orderId],
    queryFn: () => {
      if (!orderId) throw new Error('Order ID is required')
      return ordersService.getOrderMaterials(orderId)
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

