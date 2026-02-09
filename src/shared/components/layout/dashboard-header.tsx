import { Package, User, Lightbulb } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { useProfile } from '@/features/auth/hooks'
import { LanguageSelector, ThemeToggle } from './index'
import { cn } from '@/shared/utils'

export function DashboardHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const company = useAuthStore((state) => state.company)
  const { data: profile } = useProfile()

  // Determinar el estado de la conexión Wispro
  const isWisproConnected = profile?.wispro?.isConnected ?? false

  const pathname = location.pathname

  let title: string

  if (company === 'mecatronics') {
    // Secciones de Inventario (Mecatronics)
    if (pathname.startsWith('/dashboard/inventory/stock')) {
      title = `${t('sidebar.inventory')} / ${t('sidebar.stockManagement')}`
    } else if (pathname.startsWith('/dashboard/inventory/transfers')) {
      title = `${t('sidebar.inventory')} / ${t('sidebar.transfers')}`
    } else if (pathname.startsWith('/dashboard/inventory/materials')) {
      title = `${t('sidebar.inventory')} / ${t('sidebar.materials')}`
    } else if (pathname.startsWith('/dashboard/inventory/locations')) {
      title = `${t('sidebar.inventory')} / ${t('sidebar.locations')}`
    } else if (pathname.startsWith('/dashboard/service-orders/materials')) {
      title = `${t('sidebar.inventory')} / ${t('sidebar.serviceOrderMaterials')}`
    } else if (pathname.startsWith('/dashboard/crews')) {
      title = t('crews.title')
    } else if (pathname.startsWith('/dashboard/inventory')) {
      title = t('sidebar.inventory')
    } else {
      title = t('sidebar.inventory')
    }
  } else {
    // Secciones de Wispro
    if (pathname === '/dashboard') {
      title = t('dashboard.title')
    } else if (pathname.startsWith('/dashboard/employees')) {
      title = `${t('dashboard.title')} / ${t('employees.title')}`
    } else {
      title = t('dashboard.title')
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          {/* Company Badge */}
          {company === 'mecatronics' && profile?.wispro && (
            <button
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                isWisproConnected
                  ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50'
                  : 'bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50'
              )}
            >
              <Lightbulb
                className={cn(
                  'h-4 w-4',
                  isWisproConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              />
              <span
                className={cn(
                  'font-medium text-sm',
                  isWisproConnected
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                Wispro
              </span>
            </button>
          )}
          {company === 'wispro' && (
            <button
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50'
              )}
            >
              <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-sm text-emerald-700 dark:text-emerald-300">
                Wispro
              </span>
            </button>
          )}
          <LanguageSelector />
          <ThemeToggle />
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}

