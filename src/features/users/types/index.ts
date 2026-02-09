export interface Role {
  id: string
  name: string
  resource_id: string | null
  resource_type: string | null
}

export interface EmployeeResponse {
  public_id: string
  name: string
  email: string
  id: string
  phone_mobile: string
  active: boolean
  roles: Role[]
}

export interface EmployeesApiResponse {
  employees: EmployeeResponse[]
  pagination: {
    page: string | number
    per_page: string | number
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

