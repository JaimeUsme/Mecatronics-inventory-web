import { fetchWithAuth } from '@/shared/utils/fetchWithAuth'
import { SECURITY_FORMS_API_URL } from '@/shared/constants'
import type {
  FormTemplateResponseDto,
  FormSubmitPayload,
  FormReportItem,
  FormTemplateCreatePayload,
} from '../types'

export interface FormReportQuery {
  templateId?: string
  dateFrom?: string
  dateTo?: string
  date?: string
  userId?: string
  searchName?: string
  searchDocument?: string
}

/** Asegura que la URL tenga protocolo para que fetch haga una petición absoluta. */
function ensureAbsoluteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

export async function getFormTemplates(): Promise<FormTemplateResponseDto[]> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }
  const response = await fetchWithAuth(`${baseUrl}/form-templates`, {
    method: 'GET',
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al cargar los formularios de seguridad'
    throw new Error(message)
  }
  return response.json()
}

export async function createFormTemplate(
  payload: FormTemplateCreatePayload,
  templateFile?: File
): Promise<FormTemplateResponseDto> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }

  if (templateFile) {
    const formData = new FormData()
    formData.append('name', payload.name)
    if (payload.icon) formData.append('icon', payload.icon)
    if (payload.description) formData.append('description', payload.description)
    formData.append('fields', JSON.stringify(payload.fields))
    formData.append('templateFile', templateFile)

    const response = await fetchWithAuth(`${baseUrl}/form-templates`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const message =
        typeof errorBody?.message === 'string'
          ? errorBody.message
          : 'Error al crear la plantilla'
      throw new Error(message)
    }
    return response.json()
  }

  const response = await fetchWithAuth(`${baseUrl}/form-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al crear la plantilla'
    throw new Error(message)
  }
  return response.json()
}

export async function updateFormTemplate(
  id: string,
  payload: FormTemplateCreatePayload,
  templateFile?: File
): Promise<FormTemplateResponseDto> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }

  if (templateFile) {
    const formData = new FormData()
    formData.append('name', payload.name)
    if (payload.icon) formData.append('icon', payload.icon)
    if (payload.description) formData.append('description', payload.description)
    formData.append('fields', JSON.stringify(payload.fields))
    formData.append('templateFile', templateFile)

    const response = await fetchWithAuth(`${baseUrl}/form-templates/${id}`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      const message =
        typeof errorBody?.message === 'string'
          ? errorBody.message
          : 'Error al actualizar la plantilla'
      throw new Error(message)
    }
    return response.json()
  }

  const response = await fetchWithAuth(`${baseUrl}/form-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al actualizar la plantilla'
    throw new Error(message)
  }
  return response.json()
}

/**
 * Activa o desactiva una plantilla.
 * PATCH /form-templates/:id/active
 * Body: { isActive: true | false }
 */
export async function patchTemplateActive(
  id: string,
  isActive: boolean
): Promise<FormTemplateResponseDto> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }
  const response = await fetchWithAuth(`${baseUrl}/form-templates/${id}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : isActive
          ? 'Error al activar la plantilla'
          : 'Error al desactivar la plantilla'
    throw new Error(message)
  }
  return response.json()
}

export async function submitForm(payload: FormSubmitPayload): Promise<void> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }
  const response = await fetchWithAuth(`${baseUrl}/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al enviar el formulario'
    throw new Error(message)
  }
}

export async function getFormReport(
  query: FormReportQuery = {}
): Promise<FormReportItem[]> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }
  const params = new URLSearchParams()
  if (query.templateId) params.set('templateId', query.templateId)
  if (query.dateFrom) params.set('dateFrom', query.dateFrom)
  if (query.dateTo) params.set('dateTo', query.dateTo)
  if (query.date) params.set('date', query.date)
  if (query.userId) params.set('userId', query.userId)
  if (query.searchName) params.set('searchName', query.searchName)
  if (query.searchDocument) params.set('searchDocument', query.searchDocument)
  const qs = params.toString()
  const url = qs ? `${baseUrl}/forms/report?${qs}` : `${baseUrl}/forms/report`
  const response = await fetchWithAuth(url, { method: 'GET' })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al cargar el reporte de formularios'
    throw new Error(message)
  }
  const data = await response.json()
  return Array.isArray(data) ? data : data?.items ?? data?.data ?? []
}

/**
 * Descarga el PDF de un formulario firmado.
 * GET /forms/:id/export → binario PDF.
 */
export async function exportFormPdf(
  formId: string
): Promise<{ blob: Blob; filename: string }> {
  const baseUrl = ensureAbsoluteUrl(SECURITY_FORMS_API_URL)
  if (!baseUrl) {
    throw new Error('VITE_SECURITY_FORMS_API_URL is not configured')
  }
  const response = await fetchWithAuth(`${baseUrl}/forms/${formId}/export`, {
    method: 'GET',
  })
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Formulario no encontrado')
    }
    const errorBody = await response.json().catch(() => ({}))
    const message =
      typeof errorBody?.message === 'string'
        ? errorBody.message
        : 'Error al descargar el PDF'
    throw new Error(message)
  }
  const blob = await response.blob()
  let filename = `formulario-${formId.slice(0, 8)}.pdf`
  const disposition = response.headers.get('Content-Disposition')
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/)
    if (match?.[1]) filename = match[1].trim()
  }
  return { blob, filename }
}
