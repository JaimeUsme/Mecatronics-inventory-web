import type { CrewResponse } from '../types'
import type {
  NewCrewConfig,
  LeaderConflict,
  LeaderResolution,
  MaterialMovementPreview,
  CrewInventory,
} from '../types/reconfigure.types'
import type { EmployeeResponse } from '@/features/users/types'

/**
 * Detecta conflictos de líderes en las nuevas cuadrillas
 * Un conflicto ocurre cuando:
 * 1. El líder de una cuadrilla está en los técnicos de otra cuadrilla
 * 2. Un técnico es líder de múltiples cuadrillas
 * 3. Un técnico aparece como líder en una cuadrilla y como técnico en otra
 */
export function detectLeaderConflicts(
  newCrews: NewCrewConfig[]
): LeaderConflict[] {
  const conflicts: LeaderConflict[] = []

  // Validar que newCrews tenga datos
  if (!newCrews || newCrews.length === 0) {
    return conflicts
  }

  newCrews.forEach((newCrew, index) => {
    const tempId = newCrew.tempId || `temp-${index}`
    const conflictingLeaders: string[] = []

    // Validar que la cuadrilla tenga los campos necesarios
    if (!newCrew.leaderTechnicianId || !newCrew.technicianIds) {
      return
    }

    // Buscar si algún técnico de esta nueva cuadrilla es líder de otra nueva cuadrilla
    newCrews.forEach((otherCrew, otherIndex) => {
      if (otherIndex !== index) {
        // Validar que la otra cuadrilla tenga los campos necesarios
        if (!otherCrew.leaderTechnicianId || !otherCrew.technicianIds) {
          return
        }

        // Si el líder de otra cuadrilla está en los técnicos de esta cuadrilla
        if (newCrew.technicianIds.includes(otherCrew.leaderTechnicianId)) {
          conflictingLeaders.push(otherCrew.leaderTechnicianId)
        }
        // Si el líder de esta cuadrilla está en los técnicos de otra cuadrilla
        if (otherCrew.technicianIds.includes(newCrew.leaderTechnicianId)) {
          conflictingLeaders.push(newCrew.leaderTechnicianId)
        }
        // Si el líder de esta cuadrilla es el mismo que el líder de otra cuadrilla
        if (newCrew.leaderTechnicianId === otherCrew.leaderTechnicianId) {
          conflictingLeaders.push(newCrew.leaderTechnicianId)
        }
      }
    })

    // También verificar si hay técnicos en esta cuadrilla que son líderes de otras cuadrillas
    // (esto cubre el caso donde un líder viejo se pone como técnico en una nueva cuadrilla)
    newCrew.technicianIds.forEach((technicianId) => {
      newCrews.forEach((otherCrew, otherIndex) => {
        if (otherIndex !== index && otherCrew.leaderTechnicianId === technicianId) {
          if (!conflictingLeaders.includes(technicianId)) {
            conflictingLeaders.push(technicianId)
          }
        }
      })
    })

    // Si hay conflictos, agregar a la lista
    if (conflictingLeaders.length > 0) {
      const allLeaders = [
        newCrew.leaderTechnicianId,
        ...conflictingLeaders,
      ].filter((id, idx, arr) => arr.indexOf(id) === idx) // Eliminar duplicados

      conflicts.push({
        newCrewIndex: index,
        newCrewId: tempId,
        newCrewName: newCrew.name,
        leaders: allLeaders,
      })
    }
  })

  return conflicts
}

/**
 * Verifica si todos los técnicos de las cuadrillas viejas están asignados
 */
export function allTechniciansAssigned(
  oldCrews: CrewResponse[],
  newCrews: NewCrewConfig[]
): boolean {
  // Obtener todos los IDs de técnicos de las cuadrillas viejas
  const oldTechnicianIds = new Set<string>()

  oldCrews.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      oldTechnicianIds.add(crew.leaderTechnicianId)
    }
    crew.members.forEach((member) => {
      oldTechnicianIds.add(member.technicianId)
    })
  })

  // Obtener todos los IDs de técnicos de las nuevas cuadrillas
  const newTechnicianIds = new Set<string>()

  newCrews.forEach((crew) => {
    if (crew.leaderTechnicianId) {
      newTechnicianIds.add(crew.leaderTechnicianId)
    }
    crew.technicianIds.forEach((id) => {
      newTechnicianIds.add(id)
    })
  })

  // Verificar que todos los técnicos viejos estén en las nuevas
  for (const oldId of oldTechnicianIds) {
    if (!newTechnicianIds.has(oldId)) {
      return false
    }
  }

  return true
}

/**
 * Mapea el material de una cuadrilla vieja a una nueva cuadrilla
 * REGLA: El material sigue al líder de la cuadrilla vieja
 */
export function mapMaterialToNewCrew(
  oldCrew: CrewResponse,
  newCrews: NewCrewConfig[],
  leaderResolutions: LeaderResolution[]
): string | null {
  const oldLeaderId = oldCrew.leaderTechnicianId

  if (!oldLeaderId) {
    return 'WAREHOUSE' // Si no hay líder, material va a bodega
  }

  // 1. PRIMERO: Buscar en resoluciones de conflictos
  // Si el líder viejo fue parte de un conflicto resuelto, usar la resolución
  for (const resolution of leaderResolutions) {
    if (resolution.conflictingLeaders.includes(oldLeaderId)) {
      // El líder fue resuelto, buscar la nueva cuadrilla con el líder seleccionado
      const resolvedCrew = newCrews.find(
        (c) => c.leaderTechnicianId === resolution.selectedLeaderId
      )
      if (resolvedCrew) {
        return resolvedCrew.tempId || `temp-${newCrews.indexOf(resolvedCrew)}`
      }
    }
  }

  // 2. SEGUNDO: Buscar si el líder viejo es LÍDER de alguna nueva cuadrilla (prioridad)
  let targetCrew = newCrews.find(
    (crew) => crew.leaderTechnicianId === oldLeaderId
  )

  if (targetCrew) {
    return targetCrew.tempId || `temp-${newCrews.indexOf(targetCrew)}`
  }

  // 3. TERCERO: Buscar si el líder viejo está como TÉCNICO en alguna nueva cuadrilla
  targetCrew = newCrews.find(
    (crew) => crew.technicianIds.includes(oldLeaderId)
  )

  if (targetCrew) {
    return targetCrew.tempId || `temp-${newCrews.indexOf(targetCrew)}`
  }

  // 4. Si no se encuentra, el material va a bodega
  return 'WAREHOUSE'
}

/**
 * Calcula los movimientos de material
 */
export function calculateMaterialMovements(
  oldCrews: CrewResponse[],
  newCrews: NewCrewConfig[],
  inventories: CrewInventory[],
  leaderResolutions: LeaderResolution[]
): MaterialMovementPreview[] {

  // Map para agrupar movimientos por material y destino
  const movementsMap = new Map<string, MaterialMovementPreview>()

  oldCrews.forEach((oldCrew) => {
    const inventory = inventories.find((inv) => inv.crewId === oldCrew.id)
    if (!inventory) {
      return
    }

    const targetNewCrewId = mapMaterialToNewCrew(
      oldCrew,
      newCrews,
      leaderResolutions
    )

    const finalDestinationId = targetNewCrewId || 'WAREHOUSE'
    const targetCrew = targetNewCrewId && targetNewCrewId !== 'WAREHOUSE'
      ? newCrews.find((c) => (c.tempId || `temp-${newCrews.indexOf(c)}`) === targetNewCrewId)
      : null

    inventory.inventory.forEach((item) => {
      // Crear clave única: materialId + destino
      const key = `${item.materialId}-${finalDestinationId}`
      
      if (movementsMap.has(key)) {
        // Ya existe un movimiento para este material y destino, sumar cantidad
        const existing = movementsMap.get(key)!
        existing.quantity += item.stock
      } else {
        // Nuevo movimiento
        const movement: MaterialMovementPreview = {
          materialId: item.materialId,
          materialName: item.materialName,
          fromCrewId: oldCrew.id,
          fromCrewName: oldCrew.name,
          toCrewId: finalDestinationId,
          toCrewName: targetCrew?.name || 'Bodega',
          quantity: item.stock,
          unit: item.unit,
        }
        movementsMap.set(key, movement)
      }
    })
  })

  // Convertir map a array
  return Array.from(movementsMap.values())
}

/**
 * Obtiene el nombre de un técnico por su ID
 */
export function getTechnicianName(
  technicianId: string,
  employees: EmployeeResponse[]
): string {
  const employee = employees.find((emp) => emp.id === technicianId)
  return employee?.name || technicianId
}

/**
 * Genera un ID temporal para una nueva cuadrilla
 */
export function generateTempId(index: number): string {
  return `temp-${index}`
}

