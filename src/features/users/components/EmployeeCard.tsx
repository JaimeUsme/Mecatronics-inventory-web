import { Mail, Phone } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils'
import { useTranslation } from 'react-i18next'

export interface Employee {
  id: string
  public_id: string
  name: string
  email: string
  phone: string
  status?: 'Activo' | 'De Licencia' | 'Inactivo'
  role?: string
  roleName?: string
}

interface EmployeeCardProps {
  employee: Employee
}

const statusColors = {
  Activo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'De Licencia': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Inactivo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {employee.name}
          </h3>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {employee.status && (
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                statusColors[employee.status]
              )}
            >
              {employee.status}
            </span>
          )}
        </div>
      </div>

      {/* Etiqueta de rol */}
      {employee.roleName && (
        <div className="mb-4">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {employee.roleName}
          </span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          <span>{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          <span>{employee.phone}</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-gray-300 dark:border-gray-700"
      >
        {t('employees.viewDetails')}
      </Button>
    </Card>
  )
}

