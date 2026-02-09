import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronDown, UserPlus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card } from '@/shared/components/ui/card'
import type { NewCrewConfig } from '../../types/reconfigure.types'
import type { EmployeeResponse } from '@/features/users/types'
import { cn } from '@/shared/utils'

interface CreateNewCrewFormProps {
  crew?: NewCrewConfig
  availableTechnicians: EmployeeResponse[] // Técnicos disponibles de las cuadrillas seleccionadas
  alreadyAssignedTechnicianIds?: string[] // IDs de técnicos ya asignados a otras cuadrillas
  onSave: (crew: NewCrewConfig) => void
  onCancel: () => void
}

export function CreateNewCrewForm({
  crew,
  availableTechnicians,
  alreadyAssignedTechnicianIds = [],
  onSave,
  onCancel,
}: CreateNewCrewFormProps) {
  const { t } = useTranslation()

  const [name, setName] = useState(crew?.name || '')
  const [description, setDescription] = useState(crew?.description || '')
  const [leaderId, setLeaderId] = useState<string>(crew?.leaderTechnicianId || '')
  // Al inicializar, excluir el líder de technicianIds si está presente (porque se agrega automáticamente al guardar)
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>(() => {
    if (!crew?.technicianIds) return []
    // Filtrar el líder si está presente en technicianIds
    const leaderId = crew.leaderTechnicianId
    return leaderId 
      ? crew.technicianIds.filter(id => id !== leaderId)
      : crew.technicianIds
  })
  const [leaderSearch, setLeaderSearch] = useState('')
  const [technicianSearch, setTechnicianSearch] = useState('')
  const [isLeaderListOpen, setIsLeaderListOpen] = useState(false)
  const [isTechnicianListOpen, setIsTechnicianListOpen] = useState(false)
  const leaderListRef = useRef<HTMLDivElement>(null)
  const technicianListRef = useRef<HTMLDivElement>(null)

  // Filtrar técnicos disponibles excluyendo los ya asignados a otras cuadrillas
  // Si estamos editando, los técnicos de la cuadrilla actual no deben excluirse
  const currentCrewTechnicianIds = crew
    ? [crew.leaderTechnicianId, ...crew.technicianIds]
    : []

  const availableTechniciansFiltered = availableTechnicians.filter(
    (tech) =>
      !alreadyAssignedTechnicianIds.includes(tech.id) ||
      currentCrewTechnicianIds.includes(tech.id)
  )

  // Filtrar técnicos disponibles basándose en la búsqueda
  const filteredLeaders = availableTechniciansFiltered.filter((tech) =>
    leaderSearch.trim() === ''
      ? true
      : tech.name.toLowerCase().includes(leaderSearch.toLowerCase())
  )

  const filteredTechnicians = availableTechniciansFiltered.filter(
    (tech) =>
      tech.id !== leaderId &&
      !selectedTechnicianIds.includes(tech.id) &&
      (technicianSearch.trim() === '' ||
        tech.name.toLowerCase().includes(technicianSearch.toLowerCase()))
  )

  const selectedLeader = filteredLeaders.find((l) => l.id === leaderId)
  const selectedTechnicians = availableTechniciansFiltered.filter((t) =>
    selectedTechnicianIds.includes(t.id)
  )

  const handleAddMember = () => {
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !leaderId) return

    const allTechnicianIds = leaderId
      ? [leaderId, ...selectedTechnicianIds]
      : selectedTechnicianIds

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      leaderTechnicianId: leaderId,
      technicianIds: allTechnicianIds,
    })
  }

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

  return (
    <Card className="p-4 border-2 border-blue-200 dark:border-blue-800">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('crews.modal.description')}
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('crews.modal.descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('crews.modal.leader')} <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={leaderListRef}>
            <button
              type="button"
              onClick={() => setIsLeaderListOpen(!isLeaderListOpen)}
              className={cn(
                'w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                !selectedLeader && 'text-muted-foreground'
              )}
            >
              <span>{selectedLeader ? selectedLeader.name : t('crews.modal.selectLeader')}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isLeaderListOpen && 'rotate-180'
                )}
              />
            </button>
            {isLeaderListOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <Input
                    placeholder={t('crews.modal.searchLeader')}
                    value={leaderSearch}
                    onChange={(e) => setLeaderSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredLeaders.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t('crews.modal.noLeaders')}
                    </div>
                  ) : (
                    filteredLeaders.map((leader) => (
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
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('crews.modal.technicians')} <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            onClick={handleAddMember}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t('crews.modal.addMember')}
          </Button>

          {isTechnicianListOpen && (
            <div className="relative" ref={technicianListRef}>
              <div className="bg-white dark:bg-gray-900 border rounded-md shadow-lg mt-2">
                <div className="p-2">
                  <Input
                    placeholder={t('crews.modal.searchTechnicians')}
                    value={technicianSearch}
                    onChange={(e) => setTechnicianSearch(e.target.value)}
                    className="mb-2"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredTechnicians.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {t('crews.modal.noTechnicians')}
                    </div>
                  ) : (
                    filteredTechnicians.map((tech) => (
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
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('crews.modal.cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!name.trim() || !leaderId}
          >
            {t('crews.modal.save')}
          </Button>
        </div>
      </form>
    </Card>
  )
}

