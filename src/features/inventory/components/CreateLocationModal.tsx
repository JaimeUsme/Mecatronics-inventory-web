import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronDown, ChevronUp, X as XIcon, AlertCircle } from 'lucide-react'
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
import { useCreateLocation } from '../hooks'
import { useDebounce } from '@/shared/hooks'
import { useTechnicians } from '@/features/users/hooks'
import { useProfile } from '@/features/auth/hooks'
import type { EmployeeResponse } from '@/features/users/types'
import { cn } from '@/shared/utils'

type UiLocationType = 'WAREHOUSE' | 'TECHNICIAN'

interface CreateLocationModalProps {
  open: boolean
  onClose: () => void
}

export function CreateLocationModal({ open, onClose }: CreateLocationModalProps) {
  const { t } = useTranslation()
  const createLocation = useCreateLocation()

  const [type, setType] = useState<UiLocationType>('WAREHOUSE')
  const [name, setName] = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(
    null
  )
  const [isTechnicianListOpen, setIsTechnicianListOpen] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showDuplicateErrorModal, setShowDuplicateErrorModal] = useState(false)
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<string>('')
  const technicianListRef = useRef<HTMLDivElement>(null)

  const debouncedEmployeeSearch = useDebounce(employeeSearch, 400)
  const { data: profile } = useProfile()

  const techniciansQuery = useTechnicians(debouncedEmployeeSearch) as any

  // Solo mostrar técnicos si está conectado a Wispro
  const isWisproConnected = profile?.wispro?.isConnected === true
  const technicians: EmployeeResponse[] = isWisproConnected
    ? techniciansQuery.data?.pages.flatMap(
        (page: { employees: EmployeeResponse[] }) => page.employees
      ) ?? []
    : []

  useEffect(() => {
    if (!open) {
      setType('WAREHOUSE')
      setName('')
      setEmployeeSearch('')
      setSelectedEmployee(null)
      setIsTechnicianListOpen(false)
      setShowErrorModal(false)
      setShowDuplicateErrorModal(false)
      setDuplicateErrorMessage('')
    }
  }, [open])

  // Cerrar la lista cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        technicianListRef.current &&
        !technicianListRef.current.contains(event.target as Node)
      ) {
        setIsTechnicianListOpen(false)
      }
    }

    if (isTechnicianListOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isTechnicianListOpen])

  if (!open) return null

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    try {
      await createLocation.mutateAsync({
        type,
        name: name.trim(),
        referenceId: type === 'TECHNICIAN' ? selectedEmployee?.id : undefined,
      })
      setName('')
      setType('WAREHOUSE')
      setEmployeeSearch('')
      setSelectedEmployee(null)
      onClose()
    } catch (error) {
      console.error('Error creating location', error)
      // Si es un error 409 (Conflict), mostrar modal de duplicado
      if (error instanceof Error && 'status' in error && error.status === 409) {
        setDuplicateErrorMessage(error.message || t('locations.duplicateError'))
        setShowDuplicateErrorModal(true)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('locations.createTitle')}
            </h2>
            {createLocation.isSuccess && (
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {t('locations.createSuccess')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('locations.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('locations.form.type')}
            </label>
            <Select
              value={type}
              onValueChange={(val) => {
                const newType = val as UiLocationType
                // Si intenta cambiar a TECHNICIAN sin conexión, mostrar error
                if (newType === 'TECHNICIAN' && !isWisproConnected) {
                  setShowErrorModal(true)
                  return
                }
                setType(newType)
                // Si cambia a WAREHOUSE, limpiar selección de técnico
                if (newType === 'WAREHOUSE') {
                  setSelectedEmployee(null)
                  setEmployeeSearch('')
                  setIsTechnicianListOpen(false)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('locations.form.typePlaceholder') || ''}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WAREHOUSE">
                  {t('locations.type.warehouse')}
                </SelectItem>
                <SelectItem value="TECHNICIAN">
                  {t('locations.type.technician')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('locations.form.name')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('locations.form.namePlaceholder') || ''}
            />
          </div>

          {type === 'TECHNICIAN' && (
            <div className="space-y-2" ref={technicianListRef}>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('locations.form.technician')}
              </label>
              <div className="relative">
                {/* Botón que muestra el técnico seleccionado o permite abrir la lista */}
                <button
                  type="button"
                  onClick={() => {
                    // Validar conexión a Wispro antes de abrir el selector
                    if (!isWisproConnected) {
                      setShowErrorModal(true)
                      return
                    }
                    setIsTechnicianListOpen(!isTechnicianListOpen)
                    if (!isTechnicianListOpen) {
                      setEmployeeSearch('')
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    selectedEmployee && 'bg-gray-50 dark:bg-gray-800'
                  )}
                >
                  {selectedEmployee ? (
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedEmployee.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedEmployee.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmployee(null)
                          setIsTechnicianListOpen(true)
                        }}
                        className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <XIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('locations.form.technicianPlaceholder') || 'Seleccionar técnico...'}
                    </span>
                  )}
                  {isTechnicianListOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 ml-2" />
                  )}
                </button>

                {/* Lista desplegable */}
                {isTechnicianListOpen && (
                  <div className="absolute z-50 w-full mt-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-lg">
                    {/* Input de búsqueda */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <Input
                        type="text"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        placeholder={t('locations.form.technicianPlaceholder') || ''}
                        className="w-full"
                        autoFocus
                      />
                    </div>

                    {/* Lista de técnicos */}
                    <div
                      className="min-h-[192px] max-h-48 overflow-y-auto"
                      onScroll={(e) => {
                        const target = e.currentTarget
                        const scrollBottom =
                          target.scrollHeight - target.scrollTop - target.clientHeight
                        if (
                          techniciansQuery.hasNextPage &&
                          !techniciansQuery.isFetchingNextPage &&
                          scrollBottom < 50
                        ) {
                          techniciansQuery.fetchNextPage()
                        }
                      }}
                    >
                      {techniciansQuery.isLoading && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('employees.loading')}
                        </div>
                      )}
                      {!techniciansQuery.isLoading && technicians.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('locations.noTechniciansFound') || 'No se encontraron técnicos'}
                        </div>
                      )}
                      {technicians.map((emp) => {
                        const isSelected = selectedEmployee?.id === emp.id
                        return (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(emp)
                              setIsTechnicianListOpen(false)
                              setEmployeeSearch('')
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-sm flex flex-col gap-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                              isSelected && 'bg-blue-50 dark:bg-blue-900/30'
                            )}
                          >
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {emp.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {emp.email}
                            </span>
                          </button>
                        )
                      })}
                      {techniciansQuery.isFetchingNextPage && (
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {t('employees.loading')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedEmployee && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('locations.selectedReference', {
                    id: selectedEmployee.id,
                  })}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              {t('materials.cancel')}
            </Button>
            <Button type="submit" disabled={createLocation.isPending}>
              {t('materials.confirm')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de error cuando no hay conexión a Wispro */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
            <div className="px-6 pt-6 pb-6">
              {/* Header con icono */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t('locations.errorTitle') || 'Conexión a Wispro requerida'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowErrorModal(false)}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label={t('locations.close')}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="pl-16">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {t('locations.wisproConnectionRequired') ||
                    'Para crear una ubicación de tipo técnico, es necesario tener una conexión activa con Wispro. Esta conexión permite acceder a la lista de técnicos disponibles en el sistema.'}
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowErrorModal(false)}
                    className="min-w-[100px]"
                  >
                    {t('materials.cancel') || 'Entendido'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de error cuando ya existe una ubicación con el mismo referenceId */}
      {showDuplicateErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-orange-200 dark:border-orange-800">
            <div className="px-6 pt-6 pb-6">
              {/* Header con icono */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t('locations.duplicateErrorTitle') || 'Ubicación duplicada'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowDuplicateErrorModal(false)}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label={t('locations.close')}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="pl-16">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {selectedEmployee
                    ? t('locations.duplicateErrorWithName', {
                        name: selectedEmployee.name,
                      }) ||
                      `Ya existe un inventario para el técnico ${selectedEmployee.name}. Por favor, selecciona un técnico diferente o verifica las ubicaciones existentes.`
                    : duplicateErrorMessage ||
                      t('locations.duplicateError') ||
                      'Ya existe una ubicación de tipo técnico asociada a este técnico. Por favor, selecciona un técnico diferente o verifica las ubicaciones existentes.'}
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDuplicateErrorModal(false)
                      setSelectedEmployee(null)
                    }}
                    className="min-w-[100px]"
                  >
                    {t('materials.cancel') || 'Entendido'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


