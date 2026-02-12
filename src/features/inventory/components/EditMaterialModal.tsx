import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Trash2 } from 'lucide-react'
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
import type { Material } from './MaterialsTable'
import { useUpdateMaterial } from '../hooks'
import {
  UNIT_OPTIONS,
  CATEGORY_OPTIONS,
  OWNERSHIP_TYPE_OPTIONS,
} from '../constants/materialOptions'

interface EditMaterialModalProps {
  open: boolean
  material: Material | null
  onClose: () => void
}

export function EditMaterialModal({
  open,
  material,
  onClose,
}: EditMaterialModalProps) {
  const { t } = useTranslation()
  const updateMaterial = useUpdateMaterial()

  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('')
  const [ownershipType, setOwnershipType] = useState<'CREW' | 'TECHNICIAN' | ''>('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    if (material && open) {
      setName(material.name)
      setUnit(material.unit)
      setCategory(material.category)
      setOwnershipType(material.ownershipType || '')
      setExistingImages(material.images || [])
      setImageFiles([])
      setImageUrls([])
    }
  }, [material, open])

  // Limpiar URLs de objetos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [imageUrls])

  // Limpiar imágenes cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      imageUrls.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      setImageFiles([])
      setImageUrls([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open || !material) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    try {
      await updateMaterial.mutateAsync({
        id: material.id,
        payload: {
          name: name.trim() || undefined,
          unit: unit || undefined,
          category: category || undefined,
          ownershipType: ownershipType || undefined,
          images: imageFiles.length > 0 ? imageFiles : undefined,
        },
      })
      onClose()
    } catch (error) {
      console.error('Error updating material', error)
    }
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: File[] = []
    const newUrls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)
      if (file) {
        newFiles.push(file)
        newUrls.push(URL.createObjectURL(file))
      }
    }
    
    setImageFiles((prev) => [...prev, ...newFiles])
    setImageUrls((prev) => [...prev, ...newUrls])
  }

  const handleRemoveNewImage = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    setImageUrls((prev) => {
      URL.revokeObjectURL(prev[indexToRemove])
      return prev.filter((_, index) => index !== indexToRemove)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
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
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder={t('materials.form.unitPlaceholder') || 'Seleccionar unidad'} />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('materials.form.category')}
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('materials.form.categoryPlaceholder') || 'Seleccionar categoría'} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('materials.form.ownershipType')}
              </label>
              <Select
                value={ownershipType}
                onValueChange={(value) => setOwnershipType(value as 'CREW' | 'TECHNICIAN')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {OWNERSHIP_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Imágenes existentes */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Imágenes existentes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {existingImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={imageUrl}
                      alt={`Existing ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agregar nuevas imágenes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('materials.form.images')} (Nuevas)
            </label>
            <div className="flex flex-col gap-3">
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
              
              {/* Previsualización de nuevas imágenes */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                    >
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Eliminar imagen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button type="submit" disabled={updateMaterial.isPending}>
              {t('materials.confirm')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
