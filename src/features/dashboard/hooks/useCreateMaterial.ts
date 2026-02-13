import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../services'
import type { CreateOrderMaterialsRequest, GetOrderMaterialsResponse } from '../types'
import { useTranslation } from 'react-i18next'

export function useCreateMaterial(orderId: string) {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return useMutation<GetOrderMaterialsResponse, Error, Omit<CreateOrderMaterialsRequest, 'locale'>>({
    mutationFn: (payload) => {
      return ordersService.createOrderMaterials(orderId, {
        ...payload,
        locale: i18n.language || 'es',
      })
    },
    onSuccess: (data) => {
      // Actualizar el cache con todos los materiales (incluyendo los nuevos)
      queryClient.setQueryData(['order-materials', orderId], data)
      // Invalidar también los feedbacks por si acaso
      queryClient.invalidateQueries({ queryKey: ['order-feedbacks', orderId] })
    },
  })
}

