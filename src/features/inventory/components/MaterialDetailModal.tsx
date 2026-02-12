import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import type { Material } from './MaterialsTable'
import { cn } from '@/shared/utils'

interface MaterialDetailModalProps {
  open: boolean
  material: Material | null
  onClose: () => void
}

export function MaterialDetailModal({
  open,
  material,
  onClose,
}: MaterialDetailModalProps) {
  const { t } = useTranslation()

  if (!open || !material) return null

  const mainImage = material.images && material.images.length > 0 ? material.images[0] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-4xl mx-4 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {material.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {material.code}
            </p>
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

        {/* Content */}
        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Imagen principal */}
          {mainImage && (
            <div className="w-full">
              <img
                src={mainImage}
                alt={material.name}
                className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              />
            </div>
          )}

          {/* Información del material */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.form.name')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.columns.code')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.code}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.form.category')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.category}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.form.unit')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.unit}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.columns.stock')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.stock}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.form.minStock')}
                </label>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {material.minStock}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.columns.ownershipType')}
                </label>
                <p className="mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                      material.ownershipType === 'CREW'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}
                  >
                    {material.ownershipType === 'CREW'
                      ? t('materials.ownershipType.crew')
                      : t('materials.ownershipType.technician')}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {t('materials.columns.status')}
                </label>
                <p className="mt-1">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                      material.status === 'normal'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : material.status === 'low'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {t(`materials.status.${material.status}`)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Todas las imágenes */}
          {material.images && material.images.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Todas las imágenes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {material.images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={imageUrl}
                      alt={`${material.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 pb-6">
          <Button variant="outline" onClick={onClose}>
            {t('materials.close')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

