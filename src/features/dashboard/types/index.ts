export interface CrewMember {
  technician_id: string
  role: string | null
}

export interface CrewSnapshot {
  crew_id: string | null
  crew_name: string | null
  member_ids: string[]
  members: CrewMember[]
}

export interface GpsPoint {
  full_address: string
}

export interface Ticket {
  assigned_at: string | null
  state: string | null
  finalized_at: string | null
}

export interface OrderResponse {
  id: string
  sequential_id: number
  state: string // pending, in_progress, completed, to_reschedule, closed, etc.
  result: string // success, failure, not_set
  description: string
  created_at: string // ISO 8601
  start_at: string | null // ISO 8601
  end_at: string | null // ISO 8601
  finalized_at: string | null // ISO 8601
  employee_id: string
  employee_name: string
  orderable_name: string
  gps_point: GpsPoint | null
  ticket: Ticket | null
  crew_snapshot: CrewSnapshot | null
  programated_at: string | null // ISO 8601 format - Para determinar si está programada
}

export interface OrderComment {
  id: string
  content: string
  author: string
  created_at: string
}

export interface OrderAction {
  id: string
  action: string
  user: string
  created_at: string
}

export interface OrderImage {
  id: string
  created_at: string
  filename: string
  original: string
  thumb: string
  mini: string
}

export interface OrdersApiResponse {
  orders: OrderResponse[]
  pagination: {
    page: number
    per_page: number
    total: number | undefined
    total_pages: number | undefined
  }
  stats?: {
    unscheduled?: number
    scheduled?: number
    success?: number
    failure?: number
  }
}

export interface GetOrdersParams {
  page?: number
  per_page?: number
  in_progress?: boolean
  scheduled?: boolean
  employee_id?: string
  completed?: boolean
  search?: string
  technicianId?: string
  fromDate?: string
  toDate?: string
  unscheduled?: boolean
  scheduled_state?: boolean
  success?: boolean
  failure?: boolean
}

export interface GetMyOrdersParams {
  page?: number
  per_page?: number
  search?: string
  unscheduled?: boolean
  scheduled_state?: boolean
  success?: boolean
  failure?: boolean
}

export interface OrderMaterialUsage {
  id: string
  name: string
  unit: string
  quantityUsed: number
  quantityDamaged: number
}

export interface CreateOrderMaterialUsageRequest {
  materialId: string
  quantityUsed: number
  quantityDamaged: number
}

export interface FeedbackKind {
  id: string
  name: string
}

export interface FeedbackCreator {
  id: string
  name: string
  phone?: string
  phone_mobile?: string
  sequential_id: number
  [key: string]: any // Para otros campos que puedan venir
}

export interface OrderFeedback {
  id: string
  order_id: string
  created_at: string
  feedback_kind_id?: string
  creatable_id: string
  creatable_type: string
  body?: string
  feedback_kind?: FeedbackKind
  creator?: FeedbackCreator | null
}

export interface CreateFeedbackRequest {
  feedback: {
    body: string
    feedback_kind_id: string
  }
  locale?: string
}

// Estructura de respuesta para feedbacks (ahora es un array directo)
export type GetOrderFeedbacksResponse = OrderFeedback[]

// Estructura de respuesta para materiales
export interface GetOrderMaterialsResponse {
  materials: OrderMaterialUsage[]
}

// Request para crear materiales
export interface CreateOrderMaterialsRequest {
  materials: Array<{
    id: string
    name: string
    quantityUsed: number
    quantityDamaged: number
    unit: string
  }>
  locale?: string
}

// Nueva estructura de respuesta para imágenes
export interface GetOrderImagesResponse {
  images: OrderImage[]
  sign: OrderImage | null
}
