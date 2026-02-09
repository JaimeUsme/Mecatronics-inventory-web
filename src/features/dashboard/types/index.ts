export interface CrewMember {
  technician_id: string
  role: string | null
}

export interface CrewSnapshot {
  crew_id: string
  crew_name: string
  member_ids: string[]
  members: CrewMember[]
}

export interface OrderResponse {
  id: string
  sequential_id: number
  state: string
  employee_id?: string
  employee_name: string
  orderable_name: string
  full_address: string
  created_at: string
  assigned_at: string
  description: string
  due_date?: string
  images?: string[]
  comments?: OrderComment[]
  action_history?: OrderAction[]
  crew_snapshot?: CrewSnapshot
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
    page: string | number
    per_page: string | number
    total: number
    total_pages?: number
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
}

export interface OrderMaterialUsage {
  id?: string
  materialId: string
  materialName: string
  materialUnit: string
  quantityUsed: number
  quantityDamaged: number
  createdAt?: string
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
  feedback_kind_id: string
  creatable_id: string
  creatable_type: string
  body: string
  feedback_kind: FeedbackKind
  creator?: FeedbackCreator | null
}

export interface CreateFeedbackRequest {
  feedback: {
    body: string
    feedback_kind_id: string
  }
  locale?: string
}

