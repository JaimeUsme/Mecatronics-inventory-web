export interface User {
  id: string
  name: string
  email: string
  active: boolean
  wisproEmail?: string | null
  createdAt: string
  updatedAt: string
  isCurrentUser?: boolean
}

export interface UsersApiResponse {
  users: User[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
  stats: {
    total: number
    active: number
    inactive: number
  }
}

export interface GetUsersParams {
  page?: number
  per_page?: number
  search?: string
  active?: boolean
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface CreateUserResponse {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
}

export interface UpdateUserResponse {
  id: string
  name: string
  email: string
  active: boolean
  wisproEmail?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  email?: string
  password?: string
}

export interface UpdateProfileResponse {
  id: string
  name: string
  email: string
  active: boolean
  wisproEmail?: string
  createdAt: string
  updatedAt: string
}

// Types for Employees (Wispro)
export interface EmployeeRole {
  id: string
  name: string
}

export interface EmployeeResponse {
  id: string
  public_id: string
  name: string
  email: string
  phone_mobile: string
  active: boolean
  roles?: EmployeeRole[]
}

export interface EmployeesApiResponse {
  employees: EmployeeResponse[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages?: number
  }
}

export interface GetEmployeesParams {
  page?: number
  per_page?: number
  search?: string
  role_name?: string
}
