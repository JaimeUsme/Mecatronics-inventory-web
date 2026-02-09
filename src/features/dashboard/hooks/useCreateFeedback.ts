import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services'
import type { CreateFeedbackRequest, OrderFeedback } from '../types'
import { useTranslation } from 'react-i18next'

export function useCreateFeedback(orderId: string) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return useMutation<OrderFeedback[], Error, Omit<CreateFeedbackRequest, 'locale'>>({
    mutationFn: (payload) => {
      return ordersService.createOrderFeedback(orderId, {
        ...payload,
        locale: i18n.language || 'es',
      })
    },
    onSuccess: (data) => {
      // Actualizar el cache con todos los feedbacks (incluyendo el nuevo)
      queryClient.setQueryData(['order-feedbacks', orderId], data)
    },
  })
}

