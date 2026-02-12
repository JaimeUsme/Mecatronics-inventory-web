import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { User, LogOut, Settings, UserCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { useAuthStore } from '@/features/auth/store'
import { useProfile } from '@/features/auth/hooks'

export function UserMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  
  // Obtener datos del usuario
  const { data: profile } = useProfile()
  
  // Usar datos del perfil
  const userName = profile?.name
  const userEmail = profile?.email

  const handleLogout = () => {
    // Limpiar todo el cache de React Query
    queryClient.clear()
    // Hacer logout
    logout()
    // Navegar al login
    navigate('/login')
  }

  const handleAccount = () => {
    setIsOpen(false)
    navigate('/dashboard/account')
  }

  const handleSettings = () => {
    setIsOpen(false)
    // TODO: Navegar a página de configuración
    console.log('Ir a configuración')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          {/* Información del usuario */}
          <div className="space-y-1 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {userName || t('userMenu.user')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userEmail || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="space-y-1">
            <button
              onClick={handleAccount}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <UserCircle className="h-4 w-4" />
              <span>{t('userMenu.account')}</span>
            </button>
            
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>{t('userMenu.settings')}</span>
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('userMenu.logout')}</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

