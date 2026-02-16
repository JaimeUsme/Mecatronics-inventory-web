import { useState } from 'react'
import { Pencil, Trash2, Image as ImageIcon, X, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { EditMaterialModal } from './EditMaterialModal'
import { MaterialDetailModal } from './MaterialDetailModal'
import { cn } from '@/shared/utils'

export interface Material {
  id: string
  code: string
  name: string
  category: string
  unit: string
  stock: number
  minStock: number
  status: 'normal' | 'low' | 'out'
  images?: string[]
  ownershipType?: 'CREW' | 'TECHNICIAN'
}

interface MaterialsTableProps {
  materials: Material[]
}

export function MaterialsTable({ materials }: MaterialsTableProps) {
  const { t } = useTranslation()

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isImagesOpen, setIsImagesOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openImages = (material: Material) => {
    setSelectedMaterial(material)
    setIsImagesOpen(true)
  }

  const closeImages = () => {
    setIsImagesOpen(false)
    setSelectedMaterial(null)
  }

  return (
    <>
      {/* Lista en tarjetas: solo móvil */}
      <div className="md:hidden space-y-3">
        {materials.map((material) => (
          <Card key={material.id} className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {material.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {material.code}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                    material.ownershipType === 'CREW'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  )}
                >
                  {material.ownershipType === 'CREW'
                    ? t('materials.ownershipType.crew')
                    : t('materials.ownershipType.technician')}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                <span>{t('materials.columns.category')}: {material.category || '—'}</span>
                <span>{t('materials.columns.unit')}: {material.unit || '—'}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 min-w-9 touch-manipulation border-gray-300 dark:border-gray-700"
                  onClick={() => {
                    setSelectedMaterial(material)
                    setIsDetailOpen(true)
                  }}
                  title={t('materials.viewDetails', 'Ver detalles')}
                >
                  <Eye className="h-4 w-4 shrink-0" />
                </Button>
                {material.images && material.images.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 touch-manipulation border-gray-300 dark:border-gray-700 flex items-center gap-1"
                    onClick={() => openImages(material)}
                  >
                    <ImageIcon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">{material.images.length}</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 min-w-9 touch-manipulation border-gray-300 dark:border-gray-700"
                  onClick={() => {
                    setSelectedMaterial(material)
                    setIsEditOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 min-w-9 touch-manipulation border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabla: solo desktop */}
      <Card className="overflow-hidden hidden md:block">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">{t('materials.columns.code')}</th>
                <th className="px-6 py-3">{t('materials.columns.name')}</th>
                <th className="px-6 py-3">{t('materials.columns.category')}</th>
                <th className="px-6 py-3">{t('materials.columns.unit')}</th>
                <th className="px-6 py-3">{t('materials.columns.ownershipType')}</th>
                <th className="px-6 py-3 text-right">
                  {t('materials.columns.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {material.code}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {material.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {material.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {material.unit}
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300 dark:border-gray-700"
                        onClick={() => {
                          setSelectedMaterial(material)
                          setIsDetailOpen(true)
                        }}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {material.images && material.images.length > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-10 border-gray-300 dark:border-gray-700 flex items-center justify-center gap-1"
                          onClick={() => openImages(material)}
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {material.images.length}
                          </span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-300 dark:border-gray-700"
                        onClick={() => {
                          setSelectedMaterial(material)
                          setIsEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isImagesOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full mx-4">
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('materials.imagesTitle', { name: selectedMaterial.name })}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {selectedMaterial.code}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImages}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={t('materials.close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Images */}
            <div className="px-6 pt-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedMaterial.images?.map((src, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={src}
                      alt={`${selectedMaterial.name} ${index + 1}`}
                      className="h-full w-full object-cover aspect-square"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 pb-6">
              <Button variant="outline" onClick={closeImages}>
                {t('materials.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
      <EditMaterialModal
        open={isEditOpen}
        material={selectedMaterial}
        onClose={() => setIsEditOpen(false)}
      />
      <MaterialDetailModal
        open={isDetailOpen}
        material={selectedMaterial}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  )
}


