import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useUpdateLocation } from '../hooks'
import type { LocationResponse } from '../types'

interface EditLocationModalProps {
  open: boolean
  location: LocationResponse | null
  onClose: () => void
}

export function EditLocationModal({
  open,
  location,
  onClose,
}: EditLocationModalProps) {
  const { t } = useTranslation()
  const updateLocation = useUpdateLocation()

  const [name, setName] = useState('')
  const [active, setActive] = useState<boolean>(true)

  useEffect(() => {
    if (location) {
      setName(location.name)
      setActive(location.active)
    }
  }, [location])

  useEffect(() => {
    if (!open) {
      setName('')
      setActive(true)
    }
  }, [open])

  if (!open || !location) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    try {
      await updateLocation.mutateAsync({
        locationId: location.id,
        payload: {
          name: name.trim(),
          active,
        },
      })
      onClose()
    } catch (error) {
      console.error('Error updating location', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-md mx-4 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('locations.editTitle') || 'Editar Ubicación'}
            </h2>
            {updateLocation.isSuccess && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {t('locations.updateSuccess') || 'Ubicación actualizada exitosamente'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('locations.close')}
            disabled={updateLocation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-4">
          {/* Tipo (solo lectura) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('locations.form.type')}
            </label>
            <Input
              value={
                location.type === 'WAREHOUSE'
                  ? t('locations.type.warehouse')
                  : location.type === 'CREW'
                  ? t('locations.type.crew') || 'Cuadrilla'
                  : t('locations.type.technician')
              }
              disabled
              className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('locations.form.name')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('locations.form.namePlaceholder') || ''}
              required
            />
          </div>

          {/* Estado activo */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('locations.form.status') || 'Estado'}
            </label>
            <Select
              value={active ? 'active' : 'inactive'}
              onValueChange={(val) => setActive(val === 'active')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  {t('locations.status.active')}
                </SelectItem>
                <SelectItem value="inactive">
                  {t('locations.status.inactive')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensaje de error */}
          {updateLocation.isError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {updateLocation.error instanceof Error
                  ? updateLocation.error.message
                  : t('locations.updateError') || 'Error al actualizar ubicación'}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={updateLocation.isPending}
            >
              {t('materials.cancel')}
            </Button>
            <Button type="submit" disabled={updateLocation.isPending || !name.trim()}>
              {updateLocation.isPending
                ? t('locations.updating') || 'Actualizando...'
                : t('materials.update') || 'Actualizar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

