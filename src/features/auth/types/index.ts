export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
}

export interface LoginErrorResponse {
  statusCode: number
  message: string
}

export interface AuthError {
  message: string
  status?: number
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  phone_mobile: string
  userable_id?: string
}

export interface WisproConnection {
  isConnected: boolean
  isLinked: boolean
  loginSuccess: boolean
  wisproEmail: string
}

export interface ProfileResponse {
  id: string
  name: string
  email: string
  userType: string
  userable_id?: string
  wispro?: WisproConnection
}

export interface ReconnectWisproResponse {
  accessToken: string | null
  success: boolean
  message: string
}

export interface AddWisproCredentialsRequest {
  wisproEmail: string
  wisproPassword: string
}

export interface AddWisproCredentialsResponse {
  accessToken: string
  success: boolean
  message: string
}
