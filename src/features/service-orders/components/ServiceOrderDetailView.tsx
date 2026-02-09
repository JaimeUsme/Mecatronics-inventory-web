import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  User,
  Package,
  Users,
  Crown,
} from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import type { OrderResponse, OrderMaterialUsage, OrderFeedback } from '@/features/dashboard/types'
import { useOrderFeedbacks } from '@/features/dashboard/hooks'


interface ServiceOrderDetailViewProps {
  order: OrderResponse
  onBack: () => void
}

// ID del tipo de feedback para materiales gastados
const MATERIAL_FEEDBACK_KIND_ID = 'bd40d1ad-5b89-42a4-a70f-2ec8b2392e16'

// Función para detectar si un feedback es de tipo material
const isMaterialFeedback = (feedback: OrderFeedback): boolean => {
  if (feedback.feedback_kind_id === MATERIAL_FEEDBACK_KIND_ID) {
    try {
      const parsed = JSON.parse(feedback.body)
      return Array.isArray(parsed.materials) || parsed.materialUsage !== undefined
    } catch {
      return false
    }
  }
  return false
}

// Función para parsear materiales de un feedback
const parseMaterialFeedback = (feedback: OrderFeedback): OrderMaterialUsage[] => {
  try {
    const parsed = JSON.parse(feedback.body)
    if (Array.isArray(parsed.materials)) {
      return parsed.materials.map((m: any) => ({
        id: m.id,
        materialId: m.materialId,
        materialName: m.materialName,
        materialUnit: m.materialUnit,
        quantityUsed: m.quantityUsed || 0,
        quantityDamaged: m.quantityDamaged || 0,
        createdAt: feedback.created_at,
      }))
    }
    if (parsed.materialUsage && Array.isArray(parsed.materialUsage)) {
      return parsed.materialUsage.map((m: any) => ({
        id: m.id,
        materialId: m.materialId,
        materialName: m.materialName,
        materialUnit: m.materialUnit,
        quantityUsed: m.quantityUsed || 0,
        quantityDamaged: m.quantityDamaged || 0,
        createdAt: feedback.created_at,
      }))
    }
  } catch (e) {
    console.error('Error parsing material feedback:', e)
  }
  return []
}

export function ServiceOrderDetailView({ order, onBack }: ServiceOrderDetailViewProps) {
  const { t } = useTranslation()
  const { data: feedbacks = [] } = useOrderFeedbacks(order.id)

  // Filtrar solo feedbacks de materiales
  const materialFeedbacks = feedbacks.filter(isMaterialFeedback)

  // Agrupar materiales de todos los feedbacks de material
  const groupedMaterials = useMemo(() => {
    const materialMap = new Map<string, OrderMaterialUsage>()

    materialFeedbacks.forEach((feedback) => {
      const materials = parseMaterialFeedback(feedback)
      materials.forEach((material) => {
        const existing = materialMap.get(material.materialId)
        if (existing) {
          materialMap.set(material.materialId, {
            ...existing,
            quantityUsed: existing.quantityUsed + material.quantityUsed,
            quantityDamaged: existing.quantityDamaged + material.quantityDamaged,
          })
        } else {
          materialMap.set(material.materialId, material)
        }
      })
    })

    return Array.from(materialMap.values())
  }, [materialFeedbacks])

  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>{t('orderDetail.backToPanel')}</span>
      </button>

      <div className="space-y-6">
        {/* Order Header */}
        <Card className="p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              ORD-{String(order.sequential_id).padStart(3, '0')}
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {order.description || t('dashboard.noDescription')}
            </h2>
          </div>
        </Card>

        {/* Crew Information */}
        {order.crew_snapshot && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('serviceOrders.crew') || 'Cuadrilla'}
              </h3>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {order.crew_snapshot.crew_name}
              </p>
              <div className="space-y-2">
                {order.crew_snapshot.members.map((member, index) => {
                  const isLeader = member.role === 'LEADER'
                  const isAssignedTechnician = member.technician_id === order.employee_id
                  const displayName = isAssignedTechnician
                    ? order.employee_name
                    : member.technician_id
                  return (
                    <div
                      key={member.technician_id || index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {isLeader ? (
                        <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                      ) : (
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {displayName}
                          {isLeader && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              ({t('serviceOrders.leader') || 'Líder'})
                            </span>
                          )}
                        </p>
                        {!isAssignedTechnician && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            ID: {member.technician_id}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Material Usage Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('orderDetail.materialUsage')}
            </h3>
          </div>
          {groupedMaterials.length > 0 ? (
            <div className="space-y-2">
              {groupedMaterials.map((material: OrderMaterialUsage, index: number) => (
                <div
                  key={material.materialId || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {material.materialName}
                    </p>
                    <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {material.quantityUsed > 0 && (
                        <span>
                          {t('orderDetail.used')}: {material.quantityUsed} {material.materialUnit}
                        </span>
                      )}
                      {material.quantityDamaged > 0 && (
                        <span>
                          {t('orderDetail.damaged')}: {material.quantityDamaged} {material.materialUnit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 py-4">
              <Package className="h-5 w-5" />
              <p className="text-sm">{t('orderDetail.noMaterialsUsed') || 'No hay materiales registrados'}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

