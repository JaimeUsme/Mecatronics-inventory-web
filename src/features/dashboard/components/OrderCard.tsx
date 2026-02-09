import { Building2, User, Calendar, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils'
import type { OrderResponse } from '../types'

interface OrderCardProps {
  order: OrderResponse
  onViewDetails?: () => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

function formatDate(dateString: string): string {
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

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'pending':
        return t('dashboard.pending')
      case 'in_progress':
        return t('dashboard.inProgress')
      case 'completed':
        return t('dashboard.completed')
      case 'cancelled':
        return t('dashboard.cancelled')
      default:
        return state
    }
  }

  const statusColor = statusColors[order.state] || statusColors.pending

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            #{order.sequential_id}
          </span>
        </div>
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            statusColor
          )}
        >
          {getStatusLabel(order.state)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {order.description || t('dashboard.noDescription')}
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-2">{order.full_address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{order.employee_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formatDate(order.assigned_at)}</span>
        </div>
      </div>

      <Button
        onClick={onViewDetails}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {t('dashboard.viewDetails')}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  )
}

