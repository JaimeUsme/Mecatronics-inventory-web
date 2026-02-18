export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'boolean'
  | 'select'
  | 'number'
  | 'email'
  | 'multi_checkbox'
  | 'signature'
  | 'clock'
  | 'checkbox'


export interface FormFieldOption {
  value: string
  label: string
}

/** Opción de un campo multi_checkbox: nombre visible + variable HTML asignada */
export interface MultiCheckboxOptionDto {
  label: string
  variable: string
}

export interface FormFieldResponseDto {
  id: string
  templateId: string
  name: string
  label: string
  /** Nombre del icono Lucide (ej: "calendar", "user") enviado por el backend */
  icon?: string
  fieldType: FormFieldType
  required: boolean
  order: number
  /** Celda del Excel (ej: "B4") - legacy */
  excelCell?: string
  /** Variable del template HTML (ej: "fechaInicioPermiso") */
  variable?: string
  /** Opciones para select (FormFieldOption[]) o multi_checkbox (MultiCheckboxOptionDto[] | string[]) */
  options?: FormFieldOption[] | string[] | MultiCheckboxOptionDto[]
}

export interface FormTemplateResponseDto {
  id: string
  name: string
  icon: string
  description: string
  version: number
  isActive: boolean
  createdAt: string
  diligencedByMeToday: boolean
  fields?: FormFieldResponseDto[]
  /** Clave o identificador de la plantilla HTML (ej: "formato-permiso-trabajo-alturas"). */
  templateHtml?: string
}

/** fieldType admitido por POST/PUT form-templates */
export type FormFieldTypeApi =
  | 'text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'textarea'
  | 'multi_checkbox'
  | 'signature'
  | 'clock'
  | 'select'

/** Campo para crear/actualizar plantilla (sin id ni templateId) */
export interface FormFieldInputDto {
  name: string
  label: string
  icon?: string
  fieldType: FormFieldTypeApi
  required?: boolean
  order?: number
  /** Celda del Excel (ej: "B4") - legacy */
  excelCell?: string
  /** Variable del template HTML (ej: "fechaInicioPermiso") — para campos que no son multi_checkbox */
  variable?: string
  /** Opciones para multi_checkbox: cada una tiene un label visible y la variable HTML asignada. O para select: FormFieldOption[] */
  options?: MultiCheckboxOptionDto[] | FormFieldOption[]
}

/** Body de POST /form-templates y PUT /form-templates/:id */
export interface FormTemplateCreatePayload {
  name: string
  icon?: string
  description?: string
  fields: FormFieldInputDto[]
  /** Clave de la plantilla HTML (ej: "formato-permiso-trabajo-alturas"). */
  templateHtml?: string
}

export type MultiCheckboxValue = Record<string, boolean>
export type FormValues = Record<string, string | number | boolean | MultiCheckboxValue | undefined>

/** Una respuesta por campo para POST /forms */
export interface FormFieldResponseItem {
  fieldId: string
  value?: string
  optionsResponse?: Record<string, boolean>
}

/** Body de POST /forms */
export interface FormSubmitPayload {
  templateId: string
  responses: FormFieldResponseItem[]
  /** Firma legacy (fallback). Se omite si hay campos tipo signature en responses. */
  signature?: string
}

/** Item del reporte GET /forms/report (formularios firmados) */
export interface FormReportItem {
  date: string
  templateName: string
  responsibleName: string
  document: string | null
  formId: string
  userId: string
}
