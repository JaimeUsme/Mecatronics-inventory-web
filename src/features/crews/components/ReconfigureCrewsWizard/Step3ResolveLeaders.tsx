import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { CrewResponse } from '../../types'
import type { LeaderResolution, NewCrewConfig } from '../../types/reconfigure.types'
import type { EmployeeResponse } from '@/features/users/types'
import { detectLeaderConflicts } from '../../utils/reconfigure.utils'

interface Step3ResolveLeadersProps {
  oldCrews: CrewResponse[]
  employees: EmployeeResponse[]
  newCrews: NewCrewConfig[]
  leaderResolutions: LeaderResolution[]
  onResolutionsChange: (resolutions: LeaderResolution[]) => void
  onPrevious: () => void
  onNext: () => void
  onCancel: () => void
}

export function Step3ResolveLeaders({
  employees,
  newCrews,
  leaderResolutions,
  onResolutionsChange,
  onPrevious,
  onNext,
  onCancel,
}: Step3ResolveLeadersProps) {
  const { t } = useTranslation()

  const conflicts = detectLeaderConflicts(newCrews)

  const handleResolutionChange = (
    conflictIndex: number,
    selectedLeaderId: string
  ) => {
    const conflict = conflicts[conflictIndex]
    const existingIndex = leaderResolutions.findIndex(
      (r) => r.newCrewId === conflict.newCrewId
    )

    const resolution: LeaderResolution = {
      newCrewId: conflict.newCrewId,
      selectedLeaderId,
      conflictingLeaders: conflict.leaders,
    }

    if (existingIndex >= 0) {
      const updated = [...leaderResolutions]
      updated[existingIndex] = resolution
      onResolutionsChange(updated)
    } else {
      onResolutionsChange([...leaderResolutions, resolution])
    }
  }

  const getResolution = (conflict: typeof conflicts[0]) => {
    return leaderResolutions.find((r) => r.newCrewId === conflict.newCrewId)
  }

  const allResolved = conflicts.every((conflict) => getResolution(conflict))

  if (conflicts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('crews.reconfigure.step3.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('crews.reconfigure.step3.description')}
          </p>
        </div>

        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                {t('crews.reconfigure.step3.noConflicts')}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {t('crews.reconfigure.step3.noConflictsDescription')}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="outline" onClick={onPrevious}>
            {t('crews.reconfigure.previous')}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {t('crews.modal.cancel')}
          </Button>
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('crews.reconfigure.next')} &gt;
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('crews.reconfigure.step3.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('crews.reconfigure.step3.description')}
        </p>
      </div>

      <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              {t('crews.reconfigure.step3.conflictsFound', {
                count: conflicts.length,
              })}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t('crews.reconfigure.step3.conflictsDescription')}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {conflicts.map((conflict, index) => {
          const resolution = getResolution(conflict)

          return (
            <Card key={conflict.newCrewId} className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {conflict.newCrewName}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('crews.reconfigure.step3.conflictDetails', {
                      count: conflict.leaders.length,
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('crews.reconfigure.step3.selectLeader')}
                  </label>
                  <Select
                    value={resolution?.selectedLeaderId || ''}
                    onValueChange={(value) =>
                      handleResolutionChange(index, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('crews.reconfigure.step3.selectLeaderPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {conflict.leaders.map((leaderId) => {
                        const leader = employees.find((e) => e.id === leaderId)
                        return (
                          <SelectItem key={leaderId} value={leaderId}>
                            {leader?.name || leaderId}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="outline" onClick={onPrevious}>
          {t('crews.reconfigure.previous')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('crews.modal.cancel')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!allResolved}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {t('crews.reconfigure.next')} &gt;
        </Button>
      </div>
    </div>
  )
}

