import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, X, Pencil, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { CreateNewCrewForm } from './CreateNewCrewForm'
import type { CrewResponse } from '../../types'
import type { NewCrewConfig } from '../../types/reconfigure.types'
import type { EmployeeResponse } from '@/features/users/types'
import { generateTempId, allTechniciansAssigned } from '../../utils/reconfigure.utils'

interface Step2DefineNewCrewsProps {
  oldCrews: CrewResponse[]
  employees: EmployeeResponse[]
  newCrews: NewCrewConfig[]
  onNewCrewsChange: (crews: NewCrewConfig[]) => void
  onPrevious: () => void
  onNext: () => void
  onCancel: () => void
  loading?: boolean
}

export function Step2DefineNewCrews({
  oldCrews,
  employees,
  newCrews,
  onNewCrewsChange,
  onPrevious,
  onNext,
  onCancel,
  loading,
}: Step2DefineNewCrewsProps) {
  const { t } = useTranslation()
  const [isCreatingCrew, setIsCreatingCrew] = useState(false)
  const [editingCrewIndex, setEditingCrewIndex] = useState<number | null>(null)

  const handleAddCrew = () => {
    setIsCreatingCrew(true)
  }

  const handleSaveCrew = (crew: NewCrewConfig) => {
    if (editingCrewIndex !== null) {
      // Editar cuadrilla existente
      const updated = [...newCrews]
      updated[editingCrewIndex] = {
        ...crew,
        tempId: updated[editingCrewIndex].tempId || generateTempId(editingCrewIndex),
      }
      onNewCrewsChange(updated)
      setEditingCrewIndex(null)
    } else {
      // Agregar nueva cuadrilla
      const newCrewWithTempId: NewCrewConfig = {
        ...crew,
        tempId: generateTempId(newCrews.length),
      }
      onNewCrewsChange([...newCrews, newCrewWithTempId])
      setIsCreatingCrew(false)
    }
  }

  const handleCancelForm = () => {
    setIsCreatingCrew(false)
    setEditingCrewIndex(null)
  }

  const handleEditCrew = (index: number) => {
    setEditingCrewIndex(index)
  }

  const handleDeleteCrew = (index: number) => {
    const updated = newCrews.filter((_, i) => i !== index)
    onNewCrewsChange(updated)
  }

  // Validaciones
  const allTechniciansAssignedCheck = allTechniciansAssigned(oldCrews, newCrews)
  const allCrewsValid = newCrews.every(
    (crew) => crew.leaderTechnicianId && crew.technicianIds.length > 0
  )
  const canProceed =
    newCrews.length > 0 && allCrewsValid && allTechniciansAssignedCheck

  // Calcular técnicos sin asignar
  const oldTechnicianIds = new Set<string>()
  oldCrews.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      oldTechnicianIds.add(crew.leaderTechnicianId)
    }
    crew.members.forEach((member) => {
      oldTechnicianIds.add(member.technicianId)
    })
  })

  const newTechnicianIds = new Set<string>()
  newCrews.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      newTechnicianIds.add(crew.leaderTechnicianId)
    }
    crew.technicianIds.forEach((id) => {
      newTechnicianIds.add(id)
    })
  })

  const unassignedTechnicians = Array.from(oldTechnicianIds).filter(
    (id) => !newTechnicianIds.has(id)
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          {t('crews.loading')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('crews.reconfigure.step2.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('crews.reconfigure.step2.description')}
        </p>
      </div>

      {/* Add Crew Button */}
      {!isCreatingCrew && editingCrewIndex === null && (
        <Button
          onClick={handleAddCrew}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t('crews.reconfigure.step2.addCrew')}
        </Button>
      )}

      {/* Create/Edit Form */}
      {(isCreatingCrew || editingCrewIndex !== null) && (
        <CreateNewCrewForm
          crew={
            editingCrewIndex !== null ? newCrews[editingCrewIndex] : undefined
          }
          availableTechnicians={employees}
          alreadyAssignedTechnicianIds={
            editingCrewIndex !== null
              ? // Si está editando, excluir técnicos de otras cuadrillas (no de la actual)
                newCrews
                  .filter((_, idx) => idx !== editingCrewIndex)
                  .flatMap((c) => [
                    c.leaderTechnicianId,
                    ...c.technicianIds,
                  ])
              : // Si está creando nueva, excluir todos los técnicos ya asignados
                newCrews.flatMap((c) => [
                  c.leaderTechnicianId,
                  ...c.technicianIds,
                ])
          }
          onSave={handleSaveCrew}
          onCancel={handleCancelForm}
        />
      )}

      {/* Created Crews List */}
      {newCrews.length > 0 && (
        <div className="space-y-3">
          {newCrews.map((crew, index) => {
            const leader = employees.find(
              (emp) => emp.id === crew.leaderTechnicianId
            )

            return (
              <Card key={crew.tempId || index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {crew.name}
                      </h4>
                      {leader && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                          <Users className="h-3 w-3" />
                          <span className="text-blue-700 dark:text-blue-300">
                            {leader.name}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {t('crews.details.leaderBadge')}
                          </span>
                        </div>
                      )}
                    </div>
                    {crew.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {crew.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {t('crews.reconfigure.step2.membersCount', {
                        count: crew.technicianIds.length,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditCrew(index)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteCrew(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('crews.reconfigure.step2.summary')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('crews.reconfigure.step2.summaryDetails', {
              newCrews: newCrews.length,
              unassigned: unassignedTechnicians.length,
            })}
          </p>
          {unassignedTechnicians.length > 0 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {t('crews.reconfigure.step2.unassignedWarning')}
            </p>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={onPrevious}>
          {t('crews.reconfigure.previous')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('crews.modal.cancel')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {t('crews.reconfigure.next')} &gt;
        </Button>
      </div>
    </div>
  )
}

