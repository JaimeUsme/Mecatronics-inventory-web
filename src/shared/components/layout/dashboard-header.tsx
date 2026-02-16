import { Package, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProfile } from '@/features/auth/hooks'
import { LanguageSelector, ThemeToggle, WisproConnectionStatus, UserMenu } from './index'

interface DashboardHeaderProps {
  onOpenMobileMenu?: () => void
}

export function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { data: profile } = useProfile()

  const pathname = location.pathname

  let title: string

  // Determinar el título según la ruta
  if (pathname === '/dashboard') {
    title = `${t('dashboard.title')} / ${t('sidebar.allOrders')}`
  } else if (pathname.startsWith('/dashboard/my-orders')) {
    title = `${t('dashboard.title')} / ${t('sidebar.myOrders')}`
  } else if (pathname.startsWith('/dashboard/employees')) {
    title = `${t('dashboard.title')} / ${t('employees.title')}`
  } else if (pathname.startsWith('/dashboard/inventory/stock')) {
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
  } else if (pathname.startsWith('/dashboard/users')) {
    title = t('users.title')
  } else if (pathname.startsWith('/dashboard/account')) {
    title = t('account.title')
  } else if (pathname.startsWith('/dashboard/inventory')) {
    title = t('sidebar.inventory')
  } else {
    title = t('dashboard.title')
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
        {/* Menú móvil + logo y título (en móvil solo hamburger + título de la vista) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 shrink-0"
            aria-label={t('sidebar.openMenu')}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden md:flex h-10 w-10 rounded bg-blue-600 items-center justify-center shrink-0">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h1>
        </div>

        {/* Controles: solo en desktop; en móvil van en el sidebar */}
        <div className="hidden md:flex items-center gap-4">
          {profile?.wispro && (
            <WisproConnectionStatus />
          )}
          <LanguageSelector />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

