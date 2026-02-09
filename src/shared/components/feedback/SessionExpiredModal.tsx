import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { useAuthStore } from '@/features/auth/store'
import { useQueryClient } from '@tanstack/react-query'

interface SessionExpiredModalProps {
  isOpen: boolean
}

export function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const queryClient = useQueryClient()

  const handleGoToLogin = () => {
    // Limpiar todo el cache de React Query
    queryClient.clear()
    // Hacer logout
    logout()
    // Navegar al login
    navigate('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('auth.sessionExpired.title') || 'Sesión Expirada'}
              </CardTitle>
              <CardDescription className="mt-2">
                {t('auth.sessionExpired.message') || 
                  'Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button
              onClick={handleGoToLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('auth.sessionExpired.goToLogin') || 'Ir al Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

