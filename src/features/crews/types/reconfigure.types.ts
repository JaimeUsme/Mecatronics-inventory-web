import type { CrewResponse } from './index'

export interface NewCrewConfig {
  name: string
  description?: string
  leaderTechnicianId: string
  technicianIds: string[]
  tempId?: string // ID temporal para el frontend
}

export interface LeaderResolution {
  newCrewId: string // ID temporal de la nueva cuadrilla
  selectedLeaderId: string // ID del técnico elegido como líder final
  conflictingLeaders: string[] // IDs de los otros líderes que había
}

export interface LeaderConflict {
  newCrewIndex: number
  newCrewId: string
  newCrewName: string
  leaders: string[] // IDs de todos los líderes en conflicto
}

export interface MaterialMovementPreview {
  materialId: string
  materialName: string
  fromCrewId: string
  fromCrewName: string
  toCrewId: string // Puede ser ID temporal o 'WAREHOUSE'
  toCrewName: string
  quantity: number
  unit: string
}

export interface ReconfigureCrewsRequest {
  oldCrewIds: string[]
  newCrews: NewCrewConfig[]
  leaderResolutions?: LeaderResolution[]
  deactivateOldCrews?: boolean
}

export interface MaterialMovement {
  materialId: string
  materialName: string
  fromCrewId: string
  toCrewId: string
  quantity: number
  unit: string
}

export interface ReconfigureCrewsPreviewResponse {
  preview: {
    materialMovements: MaterialMovementPreview[]
    summary: {
      totalMaterialsToMove: number
      totalQuantity: number
      crewsAffected: number
    }
  }
  warnings?: string[]
}

export interface ReconfigureCrewsResponse {
  success: boolean
  newCrews: CrewResponse[]
  materialMovements: MaterialMovement[]
  deactivatedCrews: string[]
}

export interface WizardState {
  currentStep: number
  selectedOldCrews: string[]
  newCrews: NewCrewConfig[]
  leaderResolutions: LeaderResolution[]
  materialMovements: MaterialMovementPreview[]
  deactivateOldCrews: boolean
}

export interface CrewInventory {
  crewId: string
  inventory: Array<{
    materialId: string
    materialName: string
    stock: number
    unit: string
  }>
}

