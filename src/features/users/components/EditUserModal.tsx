import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { useUpdateUser } from '../hooks'
import type { User } from '../types'

interface EditUserModalProps {
  open: boolean
  user: User | null
  onClose: () => void
}

export function EditUserModal({
  open,
  user,
  onClose,
}: EditUserModalProps) {
  const { t } = useTranslation()
  const updateUser = useUpdateUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user && open) {
      setName(user.name)
      setEmail(user.email)
      setPassword('')
    }
  }, [user, open])

  if (!open || !user) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.trim()) return

    try {
      const payload: { name?: string; email?: string; password?: string } = {
        name: name.trim(),
        email: email.trim(),
      }

      // Solo incluir password si se proporcionó uno
      if (password.trim()) {
        payload.password = password.trim()
      }

      await updateUser.mutateAsync({
        userId: user.id,
        payload,
      })
      setPassword('')
      onClose()
    } catch (error) {
      console.error('Error updating user', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('users.editUser')}
            </h2>
            {updateUser.isSuccess && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {t('users.updateSuccess')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('materials.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.form.name')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('users.form.namePlaceholder') || ''}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.form.email')}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('users.form.emailPlaceholder') || ''}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('users.form.password')} ({t('users.form.passwordOptional')})
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('users.form.passwordPlaceholder') || ''}
                className="pr-10"
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('users.form.passwordHint')}
            </p>
          </div>

          {/* Error message */}
          {updateUser.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {updateUser.error instanceof Error
                  ? updateUser.error.message
                  : t('users.updateError')}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? t('users.updating') : t('users.update')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

