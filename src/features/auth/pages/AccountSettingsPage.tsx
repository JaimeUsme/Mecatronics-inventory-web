import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, CheckCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { useProfile } from '@/features/auth/hooks'
import { useUpdateProfile } from '@/features/users/hooks'
import { cn } from '@/shared/utils'

export function AccountSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  // Determinar datos del usuario
  const userName = profile?.name
  const userEmail = profile?.email
  const userType = profile?.userType || 'Administrador'
  const createdAt = profile?.id ? new Date().toISOString().split('T')[0] : '2024-01-01' // TODO: obtener fecha real
  const lastLogin = profile?.id ? new Date().toISOString().split('T')[0] : new Date().toLocaleDateString('es-ES')

  // Estados para cambio de email
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleUpdateEmail = async () => {
    setEmailMessage(null)
    
    if (!newEmail || !confirmEmail) {
      setEmailMessage({ type: 'error', text: t('account.emailRequired') })
      return
    }

    if (newEmail !== confirmEmail) {
      setEmailMessage({ type: 'error', text: t('account.emailsDoNotMatch') })
      return
    }

    if (newEmail === userEmail) {
      setEmailMessage({ type: 'error', text: t('account.sameEmail') })
      return
    }

    setIsUpdatingEmail(true)
    try {
      await updateProfile.mutateAsync({ email: newEmail })
      setEmailMessage({ type: 'success', text: t('account.emailUpdated') })
      setNewEmail('')
      setConfirmEmail('')
    } catch (error) {
      setEmailMessage({ type: 'error', text: t('account.emailUpdateError') })
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordMessage(null)
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('account.passwordRequired') })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('account.passwordsDoNotMatch') })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: t('account.passwordTooShort') })
      return
    }

    setIsUpdatingPassword(true)
    try {
      await updateProfile.mutateAsync({ password: newPassword })
      setPasswordMessage({ type: 'success', text: t('account.passwordUpdated') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordMessage({ type: 'error', text: t('account.passwordUpdateError') })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{t('account.backToPanel')}</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('account.title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('account.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('account.details.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* User Profile Section */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {getInitials(userName)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {userName || t('account.user')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userEmail || ''}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('account.details.company')}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  Mecatronics
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('account.details.memberSince')}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {createdAt}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('account.details.accountType')}
                </p>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {userType}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('account.details.lastLogin')}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {lastLogin}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Email Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {t('account.changeEmail.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changeEmail.currentEmail')}
              </label>
              <Input
                type="email"
                value={userEmail || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changeEmail.newEmail')}
              </label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t('account.changeEmail.newEmailPlaceholder')}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changeEmail.confirmEmail')}
              </label>
              <Input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={t('account.changeEmail.confirmEmailPlaceholder')}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            {emailMessage && (
              <div
                className={cn(
                  'flex items-center gap-2 p-3 rounded-md text-sm',
                  emailMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                )}
              >
                {emailMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{emailMessage.text}</span>
              </div>
            )}
            <Button
              onClick={handleUpdateEmail}
              disabled={isUpdatingEmail || !newEmail || !confirmEmail}
              className="w-full sm:w-auto"
            >
              {isUpdatingEmail ? t('account.changeEmail.saving') : t('account.changeEmail.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              {t('account.changePassword.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changePassword.currentPassword')}
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('account.changePassword.currentPasswordPlaceholder')}
                  className="bg-white dark:bg-gray-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changePassword.newPassword')}
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('account.changePassword.newPasswordPlaceholder')}
                  className="bg-white dark:bg-gray-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('account.changePassword.confirmPassword')}
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('account.changePassword.confirmPasswordPlaceholder')}
                  className="bg-white dark:bg-gray-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {passwordMessage && (
              <div
                className={cn(
                  'flex items-center gap-2 p-3 rounded-md text-sm',
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                )}
              >
                {passwordMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}
            <Button
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto"
            >
              {isUpdatingPassword ? t('account.changePassword.saving') : t('account.changePassword.save')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

