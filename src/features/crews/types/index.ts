export interface CrewMember {
  id: string
  crewId?: string
  technicianId: string
  role: string | null
  createdAt?: string
}

export interface CrewResponse {
  id: string
  name: string
  leaderTechnicianId: string
  description: string
  active: boolean
  createdAt: string
  members: CrewMember[]
}

export interface GetCrewsParams {
  active?: boolean
  search?: string
}

export interface CreateCrewRequest {
  name: string
  description: string
  leaderTechnicianId: string
  technicianIds: string[]
}

export interface AddCrewMemberRequest {
  technicianId: string
  role?: string | null
}

export interface UpdateCrewRequest {
  name: string
  description: string
  leaderTechnicianId: string
  technicianIds: string[]
}


