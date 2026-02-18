/**
 * Base URL de la API. Se lee de la variable de entorno VITE_API_BASE_URL.
 * En desarrollo, si no está definida, se usa http://localhost:3000.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

/**
 * Base URL del backend de Formularios de Seguridad (form-templates).
 * Solo esta vista usa este backend.
 */
export const SECURITY_FORMS_API_URL =
  import.meta.env.VITE_SECURITY_FORMS_API_URL ?? ''
