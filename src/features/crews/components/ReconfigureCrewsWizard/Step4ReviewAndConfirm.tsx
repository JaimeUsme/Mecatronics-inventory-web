import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { useReconfigureCrews } from '../../hooks/useReconfigureCrews'
import { useReconfigureCrewsPreview } from '../../hooks/useReconfigureCrewsPreview'
import type { CrewResponse } from '../../types'
import type {
  NewCrewConfig,
  LeaderResolution,
  MaterialMovementPreview,
  ReconfigureCrewsRequest,
} from '../../types/reconfigure.types'

interface Step4ReviewAndConfirmProps {
  oldCrews: CrewResponse[]
  newCrews: NewCrewConfig[]
  leaderResolutions: LeaderResolution[]
  materialMovements: MaterialMovementPreview[]
  deactivateOldCrews: boolean
  onMaterialMovementsChange: (movements: MaterialMovementPreview[]) => void
  onDeactivateChange: (value: boolean) => void
  onPrevious: () => void
  onConfirm: () => void
  onCancel: () => void
}

export function Step4ReviewAndConfirm({
  oldCrews,
  newCrews,
  leaderResolutions,
  materialMovements,
  deactivateOldCrews,
  onMaterialMovementsChange,
  onDeactivateChange,
  onPrevious,
  onConfirm,
  onCancel,
}: Step4ReviewAndConfirmProps) {
  const { t } = useTranslation()
  const reconfigureMutation = useReconfigureCrews()

  // Preparar payload para el preview
  const previewPayload: ReconfigureCrewsRequest | null =
    oldCrews.length > 0 && newCrews.length > 0
      ? {
          oldCrewIds: oldCrews.map((c) => c.id),
          newCrews: newCrews.map(({ tempId, ...crew }) => crew), // Remover tempId
          leaderResolutions: leaderResolutions.length > 0 ? leaderResolutions : undefined,
          deactivateOldCrews: deactivateOldCrews,
        }
      : null

  // Obtener preview del backend
  const previewQuery = useReconfigureCrewsPreview(previewPayload, true)

  // Actualizar movimientos cuando el preview se carga
  useEffect(() => {
    if (previewQuery.data?.preview?.materialMovements) {
      onMaterialMovementsChange(previewQuery.data.preview.materialMovements)
    }
  }, [previewQuery.data, onMaterialMovementsChange])

  const loading = previewQuery.isLoading
  const materialMovementsToShow = previewQuery.data?.preview?.materialMovements || materialMovements
  const warnings = previewQuery.data?.warnings || []

  const handleConfirm = async () => {
    if (!previewPayload) return

    try {
      await reconfigureMutation.mutateAsync(previewPayload)
      onConfirm()
    } catch (error) {
      console.error('Error confirming reconfiguration:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          {t('crews.reconfigure.step4.loading')}
        </p>
      </div>
    )
  }

  if (previewQuery.isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          {previewQuery.error?.message || t('crews.reconfigure.step4.error')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('crews.reconfigure.step4.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('crews.reconfigure.step4.description')}
        </p>
      </div>

      {/* Material Movements Table */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {t('crews.reconfigure.step4.movementsTitle')}
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.reconfigure.step4.material')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.reconfigure.step4.from')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.reconfigure.step4.to')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.reconfigure.step4.quantity')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {materialMovementsToShow.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {t('crews.reconfigure.step4.noMovements')}
                  </td>
                </tr>
              ) : (
                materialMovementsToShow.map((movement: MaterialMovementPreview, index: number) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {movement.materialName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {movement.fromCrewName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {movement.toCrewName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {movement.quantity} {movement.unit}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
              {t('crews.reconfigure.step4.warnings')}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning: string, index: number) => (
                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Deactivate Option */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={deactivateOldCrews}
            onChange={(e) => onDeactivateChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
              {t('crews.reconfigure.step4.deactivateOldCrews')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('crews.reconfigure.step4.deactivateDescription')}
            </p>
          </div>
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
          onClick={handleConfirm}
          disabled={reconfigureMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {reconfigureMutation.isPending
            ? t('crews.reconfigure.step4.confirming')
            : t('crews.reconfigure.step4.confirm')}
        </Button>
      </div>
    </div>
  )
}

