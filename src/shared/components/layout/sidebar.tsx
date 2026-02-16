import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Boxes,
  MapPin,
  Warehouse,
  ArrowLeftRight,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/shared/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@/shared/hooks'
import { LanguageSelector } from './language-selector'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './UserMenu'
import { WisproConnectionStatus } from './WisproConnectionStatus'
import { useProfile } from '@/features/auth/hooks'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  hasSubmenu?: boolean
  submenuItems?: Array<{
    id: string
    label: string
    path: string
    employeeId?: string
    icon?: React.ComponentType<{ className?: string }>
  }>
}

interface SidebarProps {
  onCollapseChange?: (isCollapsed: boolean) => void
  /** En móvil: si el drawer está abierto */
  mobileOpen?: boolean
  /** En móvil: cerrar el drawer (al hacer clic fuera o en un enlace) */
  onCloseMobile?: () => void
}

export function Sidebar({ onCollapseChange, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const isDesktop = useMediaQuery('md')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false)
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false)

  // En móvil el drawer siempre se muestra expandido; en desktop se respeta isCollapsed
  const effectiveCollapsed = isCollapsed && isDesktop

  const menuItems: MenuItem[] = useMemo(() => {
    // Mecatronics tiene acceso a todo
    return [
      {
        id: 'orders',
        label: t('sidebar.orders'),
        icon: Package,
        path: '/dashboard',
        hasSubmenu: true,
        submenuItems: [
          {
            id: 'all-orders',
            label: t('sidebar.allOrders'),
            path: '/dashboard',
          },
          {
            id: 'my-orders',
            label: t('sidebar.myOrders'),
            path: '/dashboard/my-orders',
          },
        ],
      },
      {
        id: 'employees',
        label: t('sidebar.employees'),
        icon: Users,
        path: '/dashboard/employees',
      },
      {
        id: 'inventory',
        label: t('sidebar.inventory'),
        icon: Package,
        path: '/dashboard/inventory',
        hasSubmenu: true,
        submenuItems: [
          {
            id: 'stock',
            label: t('sidebar.stockManagement'),
            path: '/dashboard/inventory/stock',
            icon: Warehouse,
          },
          {
            id: 'transfers',
            label: t('sidebar.transfers'),
            path: '/dashboard/inventory/transfers',
            icon: ArrowLeftRight,
          },
          {
            id: 'materials',
            label: t('sidebar.materials'),
            path: '/dashboard/inventory/materials',
            icon: Boxes,
          },
          {
            id: 'locations',
            label: t('sidebar.locations'),
            path: '/dashboard/inventory/locations',
            icon: MapPin,
          },
          {
            id: 'service-orders-materials',
            label: t('sidebar.serviceOrderMaterials'),
            path: '/dashboard/service-orders/materials',
            icon: FileText,
          },
        ],
      },
      {
        id: 'crews',
        label: t('sidebar.crews'),
        icon: Users,
        path: '/dashboard/crews',
      },
      {
        id: 'users',
        label: t('sidebar.users'),
        icon: Settings,
        path: '/dashboard/users',
      },
    ]
  }, [t])

  // Abrir automáticamente el submenú de órdenes si estamos en /dashboard o /dashboard/my-orders
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/my-orders')) {
      setOrdersMenuOpen(true)
    }
  }, [location.pathname])

  const handleItemClick = (path: string) => {
    navigate(path)
    onCloseMobile?.()
  }

  const handleSubmenuClick = (path: string) => {
    navigate(path)
    onCloseMobile?.()
    if (effectiveCollapsed) {
      setOrdersMenuOpen(false)
      setInventoryMenuOpen(false)
    }
  }

  const isActive = (path: string) => {
    // Para el dashboard, activo si es exactamente /dashboard o empieza con /dashboard?
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    // Para otras rutas, activo si coincide exactamente o empieza con la ruta
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isSubmenuActive = (path: string) => {
    // Comparar pathname directamente
    // Si el path es /dashboard, solo está activo si la URL actual es exactamente /dashboard (sin /my-orders)
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    // Para otras rutas, verificar si el pathname coincide
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      {/* Overlay en móvil cuando el drawer está abierto */}
      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={cn(
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-50',
          'w-64',
          isCollapsed ? 'md:w-16' : 'md:w-64',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Toggle button: solo en desktop */}
        <div className="hidden md:flex justify-end p-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={() => {
              const newCollapsed = !isCollapsed
              setIsCollapsed(newCollapsed)
              onCollapseChange?.(newCollapsed)
              if (!newCollapsed) {
                setOrdersMenuOpen(false)
                setInventoryMenuOpen(false)
              }
            }}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

      {/* Menu items */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          const hasActiveSubmenu = item.submenuItems?.some((sub) => isSubmenuActive(sub.path))

          if (item.hasSubmenu) {
            // Cuando está colapsado (solo en desktop), mostrar solo el botón sin submenú
            if (effectiveCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg transition-colors',
                    'justify-center px-2 py-3',
                    active || hasActiveSubmenu
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  title={item.label}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      active || hasActiveSubmenu ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </button>
              )
            }
            
            // Cuando está expandido, mostrar el menú desplegable
            const isMenuOpen = item.id === 'orders' ? ordersMenuOpen : inventoryMenuOpen
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (item.id === 'orders') {
                      setOrdersMenuOpen(!ordersMenuOpen)
                    } else if (item.id === 'inventory') {
                      setInventoryMenuOpen(!inventoryMenuOpen)
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-lg transition-colors',
                    'px-4 py-3',
                    active || hasActiveSubmenu
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        active || hasActiveSubmenu ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isMenuOpen ? 'rotate-180' : '',
                      active || hasActiveSubmenu ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                </button>
                {isMenuOpen && item.submenuItems && (
                  <div className="ml-4 space-y-1">
                    {item.submenuItems.map((subItem) => {
                      const subActive = isSubmenuActive(subItem.path)
                      const SubIcon = subItem.icon
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubmenuClick(subItem.path)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg transition-colors px-4 py-2 text-sm',
                            subActive
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}
                        >
                          {SubIcon && (
                            <SubIcon className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span className="font-medium">{subItem.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg transition-colors',
                effectiveCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                )}
              />
              {!effectiveCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

        {/* Controles en móvil: idioma, tema, perfil */}
        <div className="md:hidden flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
          {profile?.wispro && (
            <div className="pt-2">
              <WisproConnectionStatus />
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </aside>
    </>
  )
}

