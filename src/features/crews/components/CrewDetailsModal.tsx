import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, User, Crown, Calendar, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { useTechnicians } from '@/features/users/hooks'
import { useEmployees } from '@/features/users/hooks'
import { useProfile } from '@/features/auth/hooks'
import type { CrewResponse } from '../types'
import type { EmployeeResponse } from '@/features/users/types'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { cn } from '@/shared/utils'

interface CrewDetailsModalProps {
  open: boolean
  crew: CrewResponse | null
  onClose: () => void
}

export function CrewDetailsModal({
  open,
  crew,
  onClose,
}: CrewDetailsModalProps) {
  const { t, i18n } = useTranslation()
  const { data: profile } = useProfile()

  const isWisproConnected = profile?.wispro?.isConnected === true

  // Obtener todos los técnicos para mapear IDs a nombres
  const techniciansQuery = useTechnicians('') as any
  const technicians: EmployeeResponse[] = isWisproConnected
    ? techniciansQuery.data?.pages.flatMap(
        (page: { employees: EmployeeResponse[] }) => page.employees
      ) ?? []
    : []

  // Obtener todos los empleados para buscar el líder
  const employeesQuery = useEmployees({ per_page: 100 })
  const allEmployees: EmployeeResponse[] = employeesQuery.data?.employees ?? []

  // Crear un mapa de IDs a técnicos/empleados
  const technicianMap = useMemo(() => {
    const map = new Map<string, EmployeeResponse>()
    // Primero agregar técnicos
    technicians.forEach((tech) => {
      map.set(tech.id, tech)
    })
    // Luego agregar todos los empleados (sobrescribirán si hay duplicados)
    allEmployees.forEach((emp) => {
      map.set(emp.id, emp)
    })
    return map
  }, [technicians, allEmployees])

  // Obtener el líder - primero buscar en miembros con role LEADER, luego en el mapa
  const leader = useMemo(() => {
    if (!crew) return null
    
    // Buscar el miembro que es líder
    const leaderMember = crew.members.find(
      (member) => member.role === 'LEADER' || member.technicianId === crew.leaderTechnicianId
    )
    
    if (leaderMember) {
      // Buscar el técnico/empleado en el mapa
      const technician = technicianMap.get(leaderMember.technicianId)
      if (technician) {
        return technician
      }
    }
    
    // Si no se encuentra en miembros, buscar directamente por leaderTechnicianId
    return technicianMap.get(crew.leaderTechnicianId) || null
  }, [crew, technicianMap])

  // Obtener los miembros con sus datos
  const membersWithDetails = useMemo(() => {
    if (!crew) return []
    return crew.members.map((member) => {
      const technician = technicianMap.get(member.technicianId)
      return {
        ...member,
        technician,
      }
    })
    // No filtrar, mostrar todos los miembros aunque no tengan datos completos
  }, [crew, technicianMap])

  if (!open || !crew) return null

  const dateLocale = i18n.language === 'es' ? es : enUS

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd MMM yyyy, HH:mm", { locale: dateLocale })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Card className="w-full max-w-3xl mx-4 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('crews.details.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {crew.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={t('crews.details.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-6 space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('crews.details.generalInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.details.name')}
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {crew.name}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.details.status')}
                </label>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium w-fit',
                    crew.active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {crew.active
                    ? t('crews.status.active')
                    : t('crews.status.inactive')}
                </span>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('crews.details.description')}
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {crew.description || t('crews.details.noDescription')}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('crews.details.createdAt')}
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(crew.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Líder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              {t('crews.details.leader')}
            </h3>
            {leader ? (
              <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {leader.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {leader.email}
                    </p>
                    {leader.phone_mobile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {leader.phone_mobile}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    {t('crews.details.leaderBadge')}
                  </span>
                </div>
              </Card>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('crews.details.leaderNotFound')}
              </p>
            )}
          </div>

          {/* Miembros */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('crews.details.members')} ({membersWithDetails.length})
              </h3>
            </div>
            {membersWithDetails.length > 0 ? (
              <div className="space-y-2">
                {membersWithDetails.map((member) => {
                  const technician = member.technician
                  const isLeader = member.technicianId === crew.leaderTechnicianId || member.role === 'LEADER'
                  return (
                    <Card
                      key={member.id}
                      className={cn(
                        'p-4',
                        isLeader &&
                          'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'h-10 w-10 rounded-full flex items-center justify-center',
                            isLeader
                              ? 'bg-yellow-100 dark:bg-yellow-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          )}
                        >
                          {isLeader ? (
                            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {technician ? technician.name : `${t('crews.details.technicianId')}: ${member.technicianId}`}
                            </p>
                            {isLeader && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                {t('crews.details.leaderBadge')}
                              </span>
                            )}
                            {member.role && member.role !== 'LEADER' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {member.role}
                              </span>
                            )}
                          </div>
                          {technician ? (
                            <>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {technician.email}
                              </p>
                              {technician.phone_mobile && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {technician.phone_mobile}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t('crews.details.technicianInfoLoading')}
                            </p>
                          )}
                          {member.createdAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t('crews.details.memberSince')}:{' '}
                              {formatDate(member.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('crews.details.noMembers')}
              </p>
            )}
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('crews.details.close')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

