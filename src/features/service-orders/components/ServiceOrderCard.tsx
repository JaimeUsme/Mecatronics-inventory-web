import { User, Calendar, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils'
import type { OrderResponse } from '@/features/dashboard/types'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

interface ServiceOrderCardProps {
  order: OrderResponse
  onClick?: () => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  closed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En Proceso',
  closed: 'Cerrada',
  cancelled: 'Cancelada',
}

function formatDate(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString)
    const dateLocale = locale === 'es' ? es : enUS
    return format(date, "dd MMM yyyy, HH:mm", { locale: dateLocale })
  } catch {
    return dateString
  }
}

export function ServiceOrderCard({ order, onClick }: ServiceOrderCardProps) {
  const { t, i18n } = useTranslation()

  const statusColor = statusColors[order.state] || statusColors.pending
  const statusLabel = statusLabels[order.state] || order.state

  const displayDate = order.assigned_at || order.created_at

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Header con ID y Status */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-base font-bold text-blue-700 dark:text-blue-500">
          #{order.sequential_id}
        </span>
        <span
          className={cn(
            'px-3 py-1 rounded-md text-xs font-medium',
            statusColor
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Descripción con chevron */}
      <div className="flex items-start gap-2 mb-6">
        <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {order.description}
        </h3>
      </div>

      {/* Información detallada */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2 flex-1">
          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('serviceOrders.card.client') || 'Cliente:'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {order.orderable_name}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-1">
          <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('serviceOrders.card.assignedTo') || 'Asignado a:'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {order.employee_name}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-1">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('serviceOrders.card.created') || 'Creada:'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {formatDate(displayDate, i18n.language || 'es')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

