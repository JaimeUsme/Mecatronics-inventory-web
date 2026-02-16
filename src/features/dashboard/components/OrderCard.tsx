import { Building2, User, Calendar, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils'
import type { OrderResponse } from '../types'
import { getOrderStatusLabel } from '../utils/orderStatus'

interface OrderCardProps {
  order: OrderResponse
  onViewDetails?: () => void
}

const statusColors: Record<string, string> = {
  programada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  no_programada: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exitosa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fallida: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  otra: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const { t } = useTranslation()

  const statusLabel = getOrderStatusLabel(order)
  
  const getStatusLabelText = (label: string) => {
    switch (label) {
      case 'programada':
        return t('dashboard.scheduled')
      case 'no_programada':
        return t('dashboard.unscheduled')
      case 'exitosa':
        return t('dashboard.success')
      case 'fallida':
        return t('dashboard.failure')
      default:
        return t('dashboard.allStatuses')
    }
  }

  const statusColor = statusColors[statusLabel] || statusColors.otra
  const fullAddress = order.gps_point?.full_address || ''

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
          #{order.sequential_id}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium shrink-0',
            statusColor
          )}
        >
          {getStatusLabelText(statusLabel)}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {order.description || t('dashboard.noDescription')}
      </h3>

      <div className="space-y-2 sm:space-y-3 mb-4">
        <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-0">
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 break-words">{fullAddress || t('dashboard.noDescription')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-0">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="line-clamp-1 truncate">{order.employee_name}</span>
        </div>
        {order.created_at && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{formatDate(order.created_at)}</span>
          </div>
        )}
      </div>

      <Button
        onClick={onViewDetails}
        className="w-full min-h-10 sm:min-h-9 bg-blue-600 hover:bg-blue-700 text-white touch-manipulation text-sm sm:text-base"
      >
        {t('dashboard.viewDetails')}
        <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
      </Button>
    </Card>
  )
}

