import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { useDeleteUser } from '../hooks'
import type { User } from '../types'

interface DeleteUserModalProps {
  open: boolean
  user: User | null
  onClose: () => void
}

export function DeleteUserModal({
  open,
  user,
  onClose,
}: DeleteUserModalProps) {
  const { t } = useTranslation()
  const deleteUser = useDeleteUser()

  if (!open || !user) return null

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id)
      onClose()
    } catch (error) {
      console.error('Error deleting user', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-xl">
        <div className="px-6 pt-6 pb-6">
          {/* Icon */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('users.deleteTitle')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t('users.deleteMessage', {
                  name: user.name,
                }) ||
                  `¿Estás seguro de que deseas desactivar el usuario "${user.name}"? Esta acción no se puede deshacer.`}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleteUser.isPending}
              className="min-w-[100px]"
            >
              {t('materials.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="min-w-[100px]"
            >
              {deleteUser.isPending
                ? t('users.deleting')
                : t('users.deleteConfirm')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

