import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  Boxes,
  MapPin,
  Warehouse,
  ArrowLeftRight,
  FileText,
} from 'lucide-react'
import { cn } from '@/shared/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { useCurrentUser } from '@/features/auth/hooks'

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
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false)
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const company = useAuthStore((state) => state.company)
  const { data: currentUser } = useCurrentUser()

  const handleLogout = () => {
    // Limpiar todo el cache de React Query
    queryClient.clear()
    // Hacer logout
    logout()
    // Navegar al login
    navigate('/login')
  }

  const menuItems: MenuItem[] = useMemo(() => {
    // Si la compañía es Mecatronics, mostrar menú de Inventario
    if (company === 'mecatronics') {
      return [
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
      ]
    }

    // Por defecto (Wispro) mostrar menú de Órdenes
    // Usar userable_id si está disponible, sino usar id
    const employeeIdForOrders = currentUser?.userable_id || currentUser?.id
    const myOrdersPath = employeeIdForOrders
      ? `/dashboard?employee_id=${employeeIdForOrders}`
      : '/dashboard'

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
            path: myOrdersPath,
            employeeId: employeeIdForOrders,
          },
        ],
      },
      {
        id: 'employees',
        label: t('sidebar.employees'),
        icon: Users,
        path: '/dashboard/employees',
      },
    ]
  }, [t, currentUser?.id, currentUser?.userable_id, company])

  const handleItemClick = (path: string) => {
    navigate(path)
  }

  const handleSubmenuClick = (path: string) => {
    navigate(path)
    if (isCollapsed) {
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
    const url = new URL(path, window.location.origin)
    const currentUrl = new URL(window.location.href)
    
    // Comparar pathname
    if (url.pathname !== currentUrl.pathname) return false
    
    // Comparar employee_id si existe
    const employeeId = url.searchParams.get('employee_id')
    const currentEmployeeId = currentUrl.searchParams.get('employee_id')
    
    if (employeeId) {
      return employeeId === currentEmployeeId
    }
    
    // Si no hay employee_id en el path, está activo si tampoco hay en la URL actual
    return !currentEmployeeId
  }

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle button */}
      <div className="flex justify-end p-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
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
            // Cuando está colapsado, mostrar solo el botón sin submenú
            if (isCollapsed) {
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
                isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3',
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
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
            isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium">{t('sidebar.logout')}</span>
          )}
        </button>
      </div>
    </aside>
  )
}

