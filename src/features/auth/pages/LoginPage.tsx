import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Package, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { LanguageSelector, ThemeToggle } from '@/shared/components/layout'
import { createLoginSchema, type LoginFormData } from '../validators'
import { useInternalLogin } from '../hooks'

export function LoginPage() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const internalLoginMutation = useInternalLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
  })

  const onSubmit = (data: LoginFormData) => {
    const payload = {
      email: data.email,
      password: data.password,
    }

    internalLoginMutation.mutate(payload)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header con controles */}
      <div className="flex justify-end items-center gap-4 p-6">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      {/* Contenido centrado */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Icono */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                <Package className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('login.title')}
              </CardTitle>
              <CardDescription className="text-base text-gray-500 dark:text-gray-400">
                {t('login.subtitle')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('login.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    {...register('password')}
                    className={`${errors.password ? 'border-red-500 pr-10' : 'pr-10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Mensaje de error */}
              {internalLoginMutation.isError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {internalLoginMutation.error instanceof Error
                      ? internalLoginMutation.error.message
                      : t('login.error')}
                  </p>
                </div>
              )}

              {/* Botón Ingresar */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                disabled={internalLoginMutation.isPending}
              >
                {internalLoginMutation.isPending
                  ? t('login.submitting')
                  : t('login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

