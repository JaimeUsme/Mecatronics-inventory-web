import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { useCreateMaterial } from '../hooks'

interface CreateMaterialModalProps {
  open: boolean
  onClose: () => void
}

export function CreateMaterialModal({
  open,
  onClose,
}: CreateMaterialModalProps) {
  const { t } = useTranslation()
  const createMaterial = useCreateMaterial()

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState<string[]>([])

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !unit.trim()) return

    try {
      await createMaterial.mutateAsync({
        name: name.trim(),
        unit: unit.trim(),
        category: category.trim() || undefined,
      })
      setName('')
      setUnit('')
      setCategory('')
      setImages([])
      onClose()
    } catch (error) {
      console.error('Error creating material', error)
    }
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)
      if (file) {
        urls.push(URL.createObjectURL(file))
      }
    }
    setImages(urls)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('materials.create')}
            </h2>
            {createMaterial.isSuccess && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {t('materials.createSuccess')}
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
              {t('materials.form.name')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('materials.form.namePlaceholder') || ''}
            />
          </div>

          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('materials.form.unit')}
              </label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t('materials.form.unitPlaceholder') || ''}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('materials.form.category')}
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('materials.form.categoryPlaceholder') || ''}
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('materials.form.images')}
            </label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 cursor-pointer dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200 dark:hover:bg-gray-800">
                <span>{t('materials.form.chooseFiles') || 'Elegir archivos'}</span>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment"
                  onChange={handleFilesChange}
                  className="hidden"
                />
              </label>
              {images.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('materials.form.selectedFiles', { count: images.length }) ||
                    `${images.length} archivos seleccionados`}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button type="submit" disabled={createMaterial.isPending}>
              {t('materials.confirm')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


