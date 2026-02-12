import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Lightbulb, RefreshCw, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { cn } from '@/shared/utils'
import { useProfile } from '@/features/auth/hooks'
import { useReconnectWispro } from '@/features/auth/hooks/useReconnectWispro'
import { useAddWisproCredentials } from '@/features/auth/hooks/useAddWisproCredentials'

export function WisproConnectionStatus() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { data: profile } = useProfile()
  const reconnectMutation = useReconnectWispro()
  const addCredentialsMutation = useAddWisproCredentials()
  
  // Estados para el formulario de credenciales
  const [wisproEmail, setWisproEmail] = useState('')
  const [wisproPassword, setWisproPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isWisproConnected = profile?.wispro?.isConnected ?? false
  const isWisproLinked = profile?.wispro?.isLinked ?? false

  const handleReconnect = async () => {
    try {
      await reconnectMutation.mutateAsync()
      // Esperar un momento para que el perfil se actualice
      await new Promise((resolve) => setTimeout(resolve, 500))
      setIsOpen(false)
    } catch (error) {
      console.error('Error al reconectar:', error)
      // El error se maneja automáticamente por React Query
    }
  }

  const handleConnect = async () => {
    if (!wisproEmail.trim() || !wisproPassword.trim()) {
      return
    }
    
    try {
      await addCredentialsMutation.mutateAsync({
        wisproEmail: wisproEmail.trim(),
        wisproPassword: wisproPassword.trim(),
      })
      // La página se recargará automáticamente en onSuccess del hook
    } catch (error) {
      console.error('Error al conectar:', error)
      // El error se maneja automáticamente por React Query
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-start gap-3">
            {isWisproConnected ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  isWisproConnected
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                )}
              >
                {isWisproConnected
                  ? t('wispro.connected')
                  : isWisproLinked
                    ? t('wispro.notConnected')
                    : t('wispro.notLinked')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isWisproConnected
                  ? t('wispro.connectedMessage')
                  : isWisproLinked
                    ? t('wispro.notConnectedMessage')
                    : t('wispro.notLinkedMessage')}
              </p>
            </div>
          </div>

          {/* Formulario de credenciales (solo si no está vinculado) */}
          {!isWisproLinked && (
            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('wispro.addCredentials')}
              </p>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    {t('wispro.wisproEmail')}
                  </label>
                  <Input
                    type="email"
                    placeholder={t('wispro.wisproEmailPlaceholder')}
                    value={wisproEmail}
                    onChange={(e) => setWisproEmail(e.target.value)}
                    disabled={addCredentialsMutation.isPending}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    {t('wispro.wisproPassword')}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('wispro.wisproPasswordPlaceholder')}
                      value={wisproPassword}
                      onChange={(e) => setWisproPassword(e.target.value)}
                      disabled={addCredentialsMutation.isPending}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConnect}
                disabled={addCredentialsMutation.isPending || !wisproEmail.trim() || !wisproPassword.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {addCredentialsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('wispro.connecting')}
                  </>
                ) : (
                  t('wispro.connect')
                )}
              </Button>

              {/* Mensaje de error de conexión */}
              {addCredentialsMutation.isError && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {addCredentialsMutation.error instanceof Error
                      ? addCredentialsMutation.error.message
                      : t('wispro.connectError')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botón de reconexión (solo si está vinculado pero no conectado) */}
          {isWisproLinked && !isWisproConnected && (
            <Button
              onClick={handleReconnect}
              disabled={reconnectMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {reconnectMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t('wispro.reconnecting')}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('wispro.reconnect')}
                </>
              )}
            </Button>
          )}

          {/* Mensaje de error de reconexión */}
          {reconnectMutation.isError && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-xs text-red-600 dark:text-red-400">
                {reconnectMutation.error instanceof Error
                  ? reconnectMutation.error.message
                  : t('wispro.reconnectError')}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

