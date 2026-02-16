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

  const displayDate = order.ticket?.assigned_at || order.created_at

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Card
      className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-[0.99]"
      onClick={handleClick}
    >
      {/* Header con ID y Status */}
      <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
        <span className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-500 shrink-0">
          #{order.sequential_id}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-xs font-medium shrink-0',
            statusColor
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Descripción con chevron */}
      <div className="flex items-start gap-2 mb-4 sm:mb-6">
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
          {order.description}
        </h3>
      </div>

      {/* Información detallada: apilar en móvil, fila en desktop */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2 min-w-0">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('serviceOrders.card.client') || 'Cliente:'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {order.orderable_name}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t('serviceOrders.card.assignedTo') || 'Asignado a:'}
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {order.employee_name}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
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

