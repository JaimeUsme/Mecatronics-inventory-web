import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronDown, Search } from 'lucide-react'
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
import { useCreateTransfer } from '../hooks'
import { useMaterials } from '../hooks'
import { useLocations } from '../hooks'
import { useTechnicians } from '@/features/users/hooks'
import { useDebounce } from '@/shared/hooks'
import { useProfile } from '@/features/auth/hooks'
import type { MaterialResponse } from '../types'
import type { LocationResponse } from '../types'
import type { EmployeeResponse } from '@/features/users/types'
import { cn } from '@/shared/utils'

interface CreateTransferModalProps {
  open: boolean
  onClose: () => void
}

export function CreateTransferModal({ open, onClose }: CreateTransferModalProps) {
  const { t } = useTranslation()
  const createTransfer = useCreateTransfer()
  const { data: profile } = useProfile()

  const [materialId, setMaterialId] = useState<string>('')
  const [fromLocationId, setFromLocationId] = useState<string>('')
  const [toLocationId, setToLocationId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [technicianId, setTechnicianId] = useState<string>('')
  const [materialSearch, setMaterialSearch] = useState('')
  const [technicianSearch, setTechnicianSearch] = useState('')
  const [isMaterialListOpen, setIsMaterialListOpen] = useState(false)
  const [isTechnicianListOpen, setIsTechnicianListOpen] = useState(false)
  const materialListRef = useRef<HTMLDivElement>(null)
  const technicianListRef = useRef<HTMLDivElement>(null)

  const debouncedMaterialSearch = useDebounce(materialSearch, 400)
  const debouncedTechnicianSearch = useDebounce(technicianSearch, 400)

  const isWisproConnected = profile?.wispro?.isConnected === true

  // Obtener materiales
  const { data: materialsData } = useMaterials({
    per_page: 100,
    search: debouncedMaterialSearch || undefined,
  })
  const materials: MaterialResponse[] = materialsData?.materials ?? []

  // Obtener ubicaciones
  const { data: locationsData } = useLocations()
  const locations: LocationResponse[] = Array.isArray(locationsData)
    ? locationsData
    : []

  // Obtener técnicos
  const techniciansQuery = useTechnicians(debouncedTechnicianSearch) as any
  const technicians: EmployeeResponse[] = isWisproConnected
    ? techniciansQuery.data?.pages.flatMap(
        (page: { employees: EmployeeResponse[] }) => page.employees
      ) ?? []
    : []

  // Resetear formulario cuando se cierra
  useEffect(() => {
    if (!open) {
      setMaterialId('')
      setFromLocationId('')
      setToLocationId('')
      setQuantity('')
      setTechnicianId('')
      setMaterialSearch('')
      setTechnicianSearch('')
      setIsMaterialListOpen(false)
      setIsTechnicianListOpen(false)
    }
  }, [open])

  // Cerrar listas cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        materialListRef.current &&
        !materialListRef.current.contains(event.target as Node)
      ) {
        setIsMaterialListOpen(false)
      }
      if (
        technicianListRef.current &&
        !technicianListRef.current.contains(event.target as Node)
      ) {
        setIsTechnicianListOpen(false)
      }
    }

    if (isMaterialListOpen || isTechnicianListOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMaterialListOpen, isTechnicianListOpen])

  if (!open) return null

  const selectedMaterial = materials.find((m) => m.id === materialId)
  const selectedTechnician = technicians.find((t) => t.id === technicianId)

  const filteredMaterials = materials.filter((m) =>
    materialSearch.trim() === ''
      ? true
      : m.name.toLowerCase().includes(materialSearch.toLowerCase())
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!materialId || !fromLocationId || !toLocationId || !quantity) return

    const quantityNum = parseFloat(quantity)
    if (isNaN(quantityNum) || quantityNum < 0.01) {
      return
    }

    try {
      await createTransfer.mutateAsync({
        materialId,
        fromLocationId,
        toLocationId,
        quantity: quantityNum,
        technicianId: technicianId || undefined,
      })
      onClose()
    } catch (error) {
      console.error('Error creating transfer', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('transfers.createTransfer')}
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
        <form onSubmit={handleSubmit} className="px-6 pt-6 pb-6 space-y-6">
          {/* Material */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('transfers.form.material')} <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={materialListRef}>
              <button
                type="button"
                onClick={() => setIsMaterialListOpen(!isMaterialListOpen)}
                className={cn(
                  'w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                  !selectedMaterial && 'text-muted-foreground'
                )}
              >
                <span>
                  {selectedMaterial
                    ? `${selectedMaterial.name} (${selectedMaterial.unit})`
                    : t('transfers.form.selectMaterial')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isMaterialListOpen && 'rotate-180'
                  )}
                />
              </button>
              {isMaterialListOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={t('transfers.form.searchMaterial')}
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="pl-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMaterials.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('transfers.form.noMaterials')}
                      </div>
                    ) : (
                      filteredMaterials.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => {
                            setMaterialId(material.id)
                            setIsMaterialListOpen(false)
                            setMaterialSearch('')
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                            materialId === material.id &&
                              'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          <div className="font-medium">{material.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {material.category} • {material.unit}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desde Ubicación */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('transfers.form.fromLocation')} <span className="text-red-500">*</span>
            </label>
            <Select value={fromLocationId} onValueChange={setFromLocationId}>
              <SelectTrigger>
                <SelectValue placeholder={t('transfers.form.selectFromLocation')} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hacia Ubicación */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('transfers.form.toLocation')} <span className="text-red-500">*</span>
            </label>
            <Select
              value={toLocationId}
              onValueChange={setToLocationId}
              disabled={fromLocationId === '' || !materialId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('transfers.form.selectToLocation')} />
              </SelectTrigger>
              <SelectContent>
                {locations
                  .filter((loc) => {
                    // Excluir la ubicación origen
                    if (loc.id === fromLocationId) return false
                    
                    // Si el material tiene ownershipType CREW, solo permitir CREW y WAREHOUSE
                    if (selectedMaterial?.ownershipType === 'CREW') {
                      return loc.type === 'CREW' || loc.type === 'WAREHOUSE'
                    }
                    
                    // Para materiales TECHNICIAN, permitir todas las ubicaciones
                    return true
                  })
                  .map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} ({location.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedMaterial?.ownershipType === 'CREW' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('transfers.form.crewMaterialNote')}
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('transfers.form.quantity')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              required
            />
            {selectedMaterial && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('transfers.form.unit')}: {selectedMaterial.unit}
              </p>
            )}
          </div>

          {/* Técnico (Opcional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('transfers.form.technician')} ({t('transfers.form.optional')})
            </label>
            <div className="relative" ref={technicianListRef}>
              <button
                type="button"
                onClick={() => setIsTechnicianListOpen(!isTechnicianListOpen)}
                className={cn(
                  'w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                  !selectedTechnician && 'text-muted-foreground'
                )}
              >
                <span>
                  {selectedTechnician
                    ? selectedTechnician.name
                    : t('transfers.form.selectTechnician')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isTechnicianListOpen && 'rotate-180'
                  )}
                />
              </button>
              {isTechnicianListOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={t('transfers.form.searchTechnician')}
                        value={technicianSearch}
                        onChange={(e) => setTechnicianSearch(e.target.value)}
                        className="pl-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {technicians.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('transfers.form.noTechnicians')}
                      </div>
                    ) : (
                      technicians.map((technician) => (
                        <button
                          key={technician.id}
                          type="button"
                          onClick={() => {
                            setTechnicianId(technician.id)
                            setIsTechnicianListOpen(false)
                            setTechnicianSearch('')
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                            technicianId === technician.id &&
                              'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          {technician.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {technicianId && (
              <button
                type="button"
                onClick={() => setTechnicianId('')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('transfers.form.clearTechnician')}
              </button>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={
                createTransfer.isPending ||
                !materialId ||
                !fromLocationId ||
                !toLocationId ||
                !quantity ||
                parseFloat(quantity) < 0.01
              }
            >
              {createTransfer.isPending
                ? t('transfers.form.creating')
                : t('transfers.form.create')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

