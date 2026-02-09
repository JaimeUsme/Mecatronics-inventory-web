import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import type { Material } from './MaterialsTable'

interface EditMaterialModalProps {
  open: boolean
  material: Material | null
  onClose: () => void
  onSave?: (material: Material) => void
}

export function EditMaterialModal({
  open,
  material,
  onClose,
  onSave,
}: EditMaterialModalProps) {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (material && open) {
      setName(material.name)
      setUnit(material.unit)
      setCategory(material.category)
    }
  }, [material, open])

  if (!open || !material) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !unit.trim()) return

    const updated: Material = {
      ...material,
      name: name.trim(),
      unit: unit.trim(),
      category: category.trim(),
    }

    onSave?.(updated)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('materials.edit') || 'Editar Material'}
            </h2>
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

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button type="submit">{t('materials.confirm')}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


