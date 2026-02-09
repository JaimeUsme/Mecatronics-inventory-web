import { useTranslation } from 'react-i18next'
import { Users, Package, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import type { CrewResponse } from '../../types'
import { cn } from '@/shared/utils'

interface Step1SelectOldCrewsProps {
  crews: CrewResponse[]
  selectedCrews: string[]
  onSelectionChange: (crewIds: string[]) => void
  onNext: () => void
  onCancel: () => void
  loading?: boolean
}

export function Step1SelectOldCrews({
  crews,
  selectedCrews,
  onSelectionChange,
  onNext,
  onCancel,
  loading,
}: Step1SelectOldCrewsProps) {
  const { t } = useTranslation()

  const handleToggleCrew = (crewId: string) => {
    if (selectedCrews.includes(crewId)) {
      onSelectionChange(selectedCrews.filter((id) => id !== crewId))
    } else {
      onSelectionChange([...selectedCrews, crewId])
    }
  }

  // Calcular resumen
  const selectedCrewsData = crews.filter((c) => selectedCrews.includes(c.id))
  const totalTechnicians = new Set<string>()
  selectedCrewsData.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      totalTechnicians.add(crew.leaderTechnicianId)
    }
    crew.members.forEach((member) => {
      totalTechnicians.add(member.technicianId)
    })
  })

  const canProceed = selectedCrews.length > 0

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
          {t('crews.reconfigure.step1.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('crews.reconfigure.step1.description')}
        </p>
      </div>

      {/* Crews List */}
      <div className="space-y-3">
        {crews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('crews.reconfigure.step1.noCrews')}
          </div>
        ) : (
          crews.map((crew) => {
            const isSelected = selectedCrews.includes(crew.id)
            const memberCount = crew.members?.length ?? 0

            return (
              <Card
                key={crew.id}
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-md',
                  isSelected &&
                    'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => handleToggleCrew(crew.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={cn(
                        'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-700'
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {crew.name}
                        </h4>
                        {crew.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {crew.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          crew.active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        {crew.active
                          ? t('crews.status.active')
                          : t('crews.status.inactive')}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {memberCount === 1
                            ? t('crews.members.single', { count: memberCount })
                            : t('crews.members.multiple', {
                                count: memberCount,
                              })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>
                          {t('crews.reconfigure.step1.materialsCount', {
                            count: 0,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Summary */}
      {selectedCrews.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('crews.reconfigure.step1.summary')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('crews.reconfigure.step1.summaryDetails', {
                  crews: selectedCrews.length,
                  technicians: totalTechnicians.size,
                })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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

