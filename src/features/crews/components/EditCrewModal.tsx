import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronDown, UserPlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'
import { useUpdateCrew } from '../hooks/useUpdateCrew'
import { useDebounce } from '@/shared/hooks'
import { useTechnicians, useEmployees } from '@/features/users/hooks'
import { useProfile } from '@/features/auth/hooks'
import type { CrewResponse } from '../types'
import type { EmployeeResponse } from '@/features/users/types'
import { cn } from '@/shared/utils'

interface EditCrewModalProps {
  open: boolean
  crew: CrewResponse | null
  onClose: () => void
}

export function EditCrewModal({ open, crew, onClose }: EditCrewModalProps) {
  const { t } = useTranslation()
  const { data: profile } = useProfile()
  
  // Solo crear el hook si tenemos un crew válido
  const updateCrew = useUpdateCrew(crew?.id || '')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [leaderId, setLeaderId] = useState<string>('')
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([])
  const [leaderSearch, setLeaderSearch] = useState('')
  const [technicianSearch, setTechnicianSearch] = useState('')
  const [isLeaderListOpen, setIsLeaderListOpen] = useState(false)
  const [isTechnicianListOpen, setIsTechnicianListOpen] = useState(false)
  const leaderListRef = useRef<HTMLDivElement>(null)
  const technicianListRef = useRef<HTMLDivElement>(null)

  const debouncedLeaderSearch = useDebounce(leaderSearch, 400)
  const debouncedTechnicianSearch = useDebounce(technicianSearch, 400)

  const isWisproConnected = profile?.wispro?.isConnected === true

  const leadersQuery = useTechnicians(debouncedLeaderSearch) as any
  const techniciansQuery = useTechnicians(debouncedTechnicianSearch) as any
  const employeesQuery = useEmployees({ per_page: 100 })

  const leaders: EmployeeResponse[] = isWisproConnected
    ? leadersQuery.data?.pages.flatMap(
        (page: { employees: EmployeeResponse[] }) => page.employees
      ) ?? []
    : []

  const technicians: EmployeeResponse[] = isWisproConnected
    ? techniciansQuery.data?.pages.flatMap(
        (page: { employees: EmployeeResponse[] }) => page.employees
      ) ?? []
    : []

  // Obtener todos los empleados para buscar el líder actual
  const allEmployees: EmployeeResponse[] = employeesQuery.data?.employees ?? []

  // Crear un mapa combinado de técnicos y empleados para buscar el líder actual
  const allTechniciansMap = new Map<string, EmployeeResponse>()
  leaders.forEach((tech) => allTechniciansMap.set(tech.id, tech))
  technicians.forEach((tech) => allTechniciansMap.set(tech.id, tech))
  allEmployees.forEach((emp) => allTechniciansMap.set(emp.id, emp))

  // Filtrar técnicos para excluir al líder
  const availableTechnicians = technicians.filter(
    (tech) => tech.id !== leaderId && !selectedTechnicianIds.includes(tech.id)
  )

  // Pre-llenar los campos cuando se abre el modal o cambia la cuadrilla
  useEffect(() => {
    if (crew && open) {
      setName(crew.name)
      setDescription(crew.description || '')
      setLeaderId(crew.leaderTechnicianId)
      // Obtener los IDs de los técnicos miembros (excluyendo al líder)
      const memberIds = crew.members
        .filter((member) => member.technicianId !== crew.leaderTechnicianId)
        .map((member) => member.technicianId)
      setSelectedTechnicianIds(memberIds)
    } else if (!open) {
      // Limpiar cuando se cierra
      setName('')
      setDescription('')
      setLeaderId('')
      setSelectedTechnicianIds([])
      setLeaderSearch('')
      setTechnicianSearch('')
      setIsLeaderListOpen(false)
      setIsTechnicianListOpen(false)
    }
  }, [crew, open])

  // Cerrar listas cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        leaderListRef.current &&
        !leaderListRef.current.contains(event.target as Node)
      ) {
        setIsLeaderListOpen(false)
      }
      if (
        technicianListRef.current &&
        !technicianListRef.current.contains(event.target as Node)
      ) {
        setIsTechnicianListOpen(false)
      }
    }

    if (isLeaderListOpen || isTechnicianListOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isLeaderListOpen, isTechnicianListOpen])

  // Scroll infinito para líderes
  useEffect(() => {
    if (!isLeaderListOpen || !leaderListRef.current) return

    const listElement = leaderListRef.current.querySelector('[data-scrollable]')
    if (!listElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        if (leadersQuery.hasNextPage && !leadersQuery.isFetchingNextPage) {
          leadersQuery.fetchNextPage()
        }
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [isLeaderListOpen, leadersQuery])

  // Scroll infinito para técnicos
  useEffect(() => {
    if (!isTechnicianListOpen || !technicianListRef.current) return

    const listElement = technicianListRef.current.querySelector('[data-scrollable]')
    if (!listElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        if (techniciansQuery.hasNextPage && !techniciansQuery.isFetchingNextPage) {
          techniciansQuery.fetchNextPage()
        }
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [isTechnicianListOpen, techniciansQuery])

  if (!open || !crew) return null

  // Buscar el líder en todas las fuentes disponibles
  const selectedLeader =
    allTechniciansMap.get(leaderId) ||
    leaders.find((l) => l.id === leaderId) ||
    null

  // Buscar los técnicos seleccionados en todas las fuentes
  const selectedTechnicians = selectedTechnicianIds
    .map((id) => allTechniciansMap.get(id) || technicians.find((t) => t.id === id))
    .filter((t): t is EmployeeResponse => t !== undefined)

  const handleAddMember = () => {
    // Abrir el select de técnicos para agregar un nuevo miembro
    setIsTechnicianListOpen(true)
    setTechnicianSearch('')
  }

  const handleTechnicianSelect = (technicianId: string) => {
    if (!selectedTechnicianIds.includes(technicianId) && technicianId !== leaderId) {
      setSelectedTechnicianIds([...selectedTechnicianIds, technicianId])
    }
    setIsTechnicianListOpen(false)
    setTechnicianSearch('')
  }

  const handleRemoveTechnician = (technicianId: string) => {
    setSelectedTechnicianIds(
      selectedTechnicianIds.filter((id) => id !== technicianId)
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !leaderId) return

    try {
      // El líder se incluye automáticamente en technicianIds
      const allTechnicianIds = leaderId
        ? [leaderId, ...selectedTechnicianIds]
        : selectedTechnicianIds

      await updateCrew.mutateAsync({
        name: name.trim(),
        description: description.trim() || '',
        leaderTechnicianId: leaderId,
        technicianIds: allTechnicianIds,
      })
      onClose()
    } catch (error) {
      console.error('Error updating crew', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('crews.modal.editTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('crews.modal.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-6 pb-6 space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('crews.modal.name')} <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('crews.modal.namePlaceholder')}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('crews.modal.description')}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('crews.modal.descriptionPlaceholder')}
              rows={3}
              className="resize-y"
            />
          </div>

          {/* Líder */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('crews.modal.leader')} <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={leaderListRef}>
              <button
                type="button"
                onClick={() => setIsLeaderListOpen(!isLeaderListOpen)}
                className={cn(
                  'w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !selectedLeader && 'text-muted-foreground'
                )}
              >
                <span>
                  {selectedLeader
                    ? selectedLeader.name
                    : leaderId
                    ? leaderId
                    : t('crews.modal.selectLeader')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isLeaderListOpen && 'rotate-180'
                  )}
                />
              </button>
              {isLeaderListOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="p-2">
                    <Input
                      placeholder={t('crews.modal.searchLeader')}
                      value={leaderSearch}
                      onChange={(e) => setLeaderSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  <div data-scrollable className="max-h-48 overflow-y-auto">
                    {leaders.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('crews.modal.noLeaders')}
                      </div>
                    ) : (
                      leaders.map((leader) => (
                        <button
                          key={leader.id}
                          type="button"
                          onClick={() => {
                            setLeaderId(leader.id)
                            setIsLeaderListOpen(false)
                            setLeaderSearch('')
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                            leaderId === leader.id && 'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          {leader.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('crews.modal.leaderNote')}
              </p>
            </div>
          </div>

          {/* Técnicos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('crews.modal.technicians')} <span className="text-red-500">*</span>
            </label>
            
            {/* Botón para agregar miembro */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddMember}
                variant="outline"
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('crews.modal.addMember')}
              </Button>
            </div>

            {/* Select de técnicos (solo visible cuando se hace clic en agregar miembro) */}
            {isTechnicianListOpen && (
              <div className="relative" ref={technicianListRef}>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
                  <div className="p-2">
                    <Input
                      placeholder={t('crews.modal.searchTechnicians')}
                      value={technicianSearch}
                      onChange={(e) => setTechnicianSearch(e.target.value)}
                      className="mb-2"
                      autoFocus
                    />
                  </div>
                  <div data-scrollable className="max-h-48 overflow-y-auto">
                    {availableTechnicians.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {t('crews.modal.noTechnicians')}
                      </div>
                    ) : (
                      availableTechnicians.map((tech) => (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => handleTechnicianSelect(tech.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {tech.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de técnicos seleccionados */}
            {selectedTechnicians.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTechnicians.map((tech) => (
                  <div
                    key={tech.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-sm"
                  >
                    <span className="text-blue-700 dark:text-blue-300">
                      {tech.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnician(tech.id)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('crews.modal.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateCrew.isPending || !name.trim() || !leaderId}
            >
              {updateCrew.isPending
                ? t('crews.modal.saving')
                : t('crews.modal.update')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

