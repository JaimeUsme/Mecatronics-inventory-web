import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { useCrews } from '../../hooks/useCrews'
import { useEmployees } from '@/features/users/hooks'
import { Step1SelectOldCrews } from './Step1SelectOldCrews'
import { Step2DefineNewCrews } from './Step2DefineNewCrews'
import { Step3ResolveLeaders } from './Step3ResolveLeaders'
import { Step4ReviewAndConfirm } from './Step4ReviewAndConfirm'
import { WizardHeader } from './WizardHeader'
import type { WizardState, NewCrewConfig } from '../../types/reconfigure.types'
import { generateTempId } from '../../utils/reconfigure.utils'

interface ReconfigureCrewsWizardProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ReconfigureCrewsWizard({
  open,
  onClose,
  onSuccess,
}: ReconfigureCrewsWizardProps) {
  const { t } = useTranslation()
  // Obtener todas las cuadrillas (no filtrar por active) para que el usuario pueda seleccionar
  // Las que quiere reconfigurar, ya sean activas o inactivas
  const { data: crewsData, isLoading: crewsLoading } = useCrews({})
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({
    per_page: 100,
  })

  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 1,
    selectedOldCrews: [],
    newCrews: [],
    leaderResolutions: [],
    materialMovements: [],
    deactivateOldCrews: true,
  })

  // Mostrar todas las cuadrillas disponibles (igual que en la lista principal)
  const crews = crewsData ?? []
  const employees = employeesData?.employees ?? []

  // Reset wizard state when modal closes
  useEffect(() => {
    if (!open) {
      setWizardState({
        currentStep: 1,
        selectedOldCrews: [],
        newCrews: [],
        leaderResolutions: [],
        materialMovements: [],
        deactivateOldCrews: true,
      })
    }
  }, [open])

  if (!open) return null

  const selectedOldCrews = crews.filter((c) =>
    wizardState.selectedOldCrews.includes(c.id)
  )

  // Calcular los técnicos disponibles de las cuadrillas seleccionadas
  const availableTechnicianIds = new Set<string>()
  selectedOldCrews.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      availableTechnicianIds.add(crew.leaderTechnicianId)
    }
    crew.members.forEach((member) => {
      availableTechnicianIds.add(member.technicianId)
    })
  })

  // Filtrar empleados para mostrar solo los técnicos de las cuadrillas seleccionadas
  const availableTechnicians = employees.filter((emp) =>
    availableTechnicianIds.has(emp.id)
  )

  const handleNext = () => {
    if (validateCurrentStep()) {
      setWizardState((prev) => ({
        ...prev,
        currentStep: prev.currentStep + 1,
      }))
    }
  }

  const handlePrevious = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: prev.currentStep - 1,
    }))
  }

  const validateCurrentStep = (): boolean => {
    switch (wizardState.currentStep) {
      case 1:
        return wizardState.selectedOldCrews.length > 0
      case 2:
        return (
          wizardState.newCrews.length > 0 &&
          wizardState.newCrews.every(
            (crew) =>
              crew.leaderTechnicianId && crew.technicianIds.length > 0
          )
        )
      case 3:
        // Step 3 validation is handled inside the component
        return true
      case 4:
        return wizardState.materialMovements.length > 0
      default:
        return false
    }
  }

  const handleSelectionChange = (crewIds: string[]) => {
    setWizardState((prev) => ({
      ...prev,
      selectedOldCrews: crewIds,
    }))
  }

  const handleNewCrewsChange = (newCrews: NewCrewConfig[]) => {
    // Asegurar que cada nueva cuadrilla tenga un tempId
    const crewsWithTempIds = newCrews.map((crew, index) => ({
      ...crew,
      tempId: crew.tempId || generateTempId(index),
    }))

    setWizardState((prev) => ({
      ...prev,
      newCrews: crewsWithTempIds,
    }))
  }

  const handleResolutionsChange = (resolutions: typeof wizardState.leaderResolutions) => {
    setWizardState((prev) => ({
      ...prev,
      leaderResolutions: resolutions,
    }))
  }

  const handleMaterialMovementsChange = (
    movements: typeof wizardState.materialMovements
  ) => {
    setWizardState((prev) => ({
      ...prev,
      materialMovements: movements,
    }))
  }

  const handleDeactivateChange = (value: boolean) => {
    setWizardState((prev) => ({
      ...prev,
      deactivateOldCrews: value,
    }))
  }

  const handleSuccess = () => {
    onClose()
    onSuccess?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('crews.reconfigure.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('crews.reconfigure.subtitle')}
            </p>
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

        {/* Progress Indicator */}
        <WizardHeader
          currentStep={wizardState.currentStep}
          totalSteps={4}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {wizardState.currentStep === 1 && (
            <Step1SelectOldCrews
              crews={crews}
              selectedCrews={wizardState.selectedOldCrews}
              onSelectionChange={handleSelectionChange}
              onNext={handleNext}
              onCancel={onClose}
              loading={crewsLoading}
            />
          )}

          {wizardState.currentStep === 2 && (
            <Step2DefineNewCrews
              oldCrews={selectedOldCrews}
              employees={availableTechnicians}
              newCrews={wizardState.newCrews}
              onNewCrewsChange={handleNewCrewsChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCancel={onClose}
              loading={employeesLoading}
            />
          )}

          {wizardState.currentStep === 3 && (
            <Step3ResolveLeaders
              oldCrews={selectedOldCrews}
              employees={availableTechnicians}
              newCrews={wizardState.newCrews}
              leaderResolutions={wizardState.leaderResolutions}
              onResolutionsChange={handleResolutionsChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCancel={onClose}
            />
          )}

          {wizardState.currentStep === 4 && (
            <Step4ReviewAndConfirm
              oldCrews={selectedOldCrews}
              newCrews={wizardState.newCrews}
              leaderResolutions={wizardState.leaderResolutions}
              materialMovements={wizardState.materialMovements}
              deactivateOldCrews={wizardState.deactivateOldCrews}
              onMaterialMovementsChange={handleMaterialMovementsChange}
              onDeactivateChange={handleDeactivateChange}
              onPrevious={handlePrevious}
              onConfirm={handleSuccess}
              onCancel={onClose}
            />
          )}
        </div>
      </Card>
    </div>
  )
}

