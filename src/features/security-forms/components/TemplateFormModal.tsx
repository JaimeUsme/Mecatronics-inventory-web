import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  FileText,
  Eye,
  Maximize2,
  X,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { createFormTemplate, updateFormTemplate } from '../services/form-templates.service'
import { normalizeIconName } from '../lib/lucide-icon'
import { IconSelect, NO_ICON_VALUE, DEFAULT_TEMPLATE_ICON } from './IconSelect'
import { VariableSelect } from './VariableSelect'
import type {
  FormTemplateResponseDto,
  FormTemplateCreatePayload,
  FormFieldInputDto,
  FormFieldTypeApi,
  MultiCheckboxOptionDto,
  FormFieldOption,
} from '../types'

const FIELD_TYPES: FormFieldTypeApi[] = ['text', 'number', 'date', 'checkbox', 'textarea', 'multi_checkbox', 'signature', 'clock', 'select']

/** Variables del template formato-permiso-trabajo-alturas.html (logo no es variable, se usa el mismo) */
const FORMATO_ALTURAS_VARIABLES = [
  'codigo', 'version', 'fechaDocumento', 'pagina',
  'fechaInicioPermiso', 'horaInicio', 'fechaTerminacionPermiso', 'horaFinalizacion',
  'lugarEjecucionTrabajoAlturas', 'alturaAproximada',
  'trabajoInstalacion', 'trabajoMantenimiento', 'trabajoSuspension', 'trabajoReconexion',
  'certificacionTrabajoAlturasSi', 'certificacionTrabajoAlturasNo',
  'afiliacionSeguridadSocialSi', 'afiliacionSeguridadSocialNo',
  'ingeridoLicorSi', 'ingeridoLicorNo', 'induccionRiesgosSi', 'induccionRiesgosNo',
  'condicionesSaludSi', 'condicionesSaludNo',
  'persona1NombreApellidos', 'persona1TipoDocumento', 'persona1NumeroDocumento', 'persona1Cargo', 'persona1NivelCertificacionTa', 'persona1Firma',
  'persona2NombreApellidos', 'persona2TipoDocumento', 'persona2NumeroDocumento', 'persona2Cargo', 'persona2NivelCertificacionTa', 'persona2Firma',
  'persona3NombreApellidos', 'persona3TipoDocumento', 'persona3NumeroDocumento', 'persona3Cargo', 'persona3NivelCertificacionTa', 'persona3Firma',
  'persona4NombreApellidos', 'persona4TipoDocumento', 'persona4NumeroDocumento', 'persona4Cargo', 'persona4NivelCertificacionTa', 'persona4Firma',
  'persona5NombreApellidos', 'persona5TipoDocumento', 'persona5NumeroDocumento', 'persona5Cargo', 'persona5NivelCertificacionTa', 'persona5Firma',
  'medidasPrevencion', 'listadoEquiposCaidas', 'herramientasEquiposTrabajo',
  'puntosAnclaje', 'sistemasAcceso', 'factoresRiesgo',
  'eppCasco', 'eppGafas', 'eppBotas', 'eppMascarilla', 'eppGuantes', 'eppOtros', 'eppEstadoB', 'eppEstadoR', 'eppEstadoM',
  'observacionesGenerales', 'nombreAyudanteSeguridad',
  'coordinadorNombreApellido', 'autorizadorNombreApellido', 'responsableEmergenciasNombreApellido',
  'coordinadorCedula', 'autorizadorCedula', 'responsableEmergenciasCedula',
  'coordinadorFirma', 'autorizadorFirma', 'responsableEmergenciasFirma',
  'textoPiePagina',
]

/** Plantillas HTML disponibles (clave, ruta pública, etiqueta, variables). */
const HTML_TEMPLATES: Array<{ value: string; path: string; label: string; variables: string[] }> = [
  {
    value: 'formato-permiso-trabajo-alturas',
    path: '/formato-permiso-trabajo-alturas.html',
    label: 'Formato permiso trabajo en alturas',
    variables: FORMATO_ALTURAS_VARIABLES,
  },
]

function fieldTypeFromResponse(fieldType: string): FormFieldTypeApi {
  if (fieldType === 'boolean') return 'checkbox'
  if (fieldType === 'multi_checkbox') return 'multi_checkbox'
  if (fieldType === 'signature') return 'signature'
  if (FIELD_TYPES.includes(fieldType as FormFieldTypeApi)) return fieldType as FormFieldTypeApi
  return 'text'
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


interface TemplateFormModalProps {
  isOpen: boolean
  onClose: () => void
  template?: FormTemplateResponseDto | null
}

export function TemplateFormModal({
  isOpen,
  onClose,
  template,
}: TemplateFormModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isEdit = !!template

  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DEFAULT_TEMPLATE_ICON)
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormFieldInputDto[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [templateHtmlKey, setTemplateHtmlKey] = useState<string>('')
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [isReloadingHtml, setIsReloadingHtml] = useState(false)
  const [fullscreenPreviewOpen, setFullscreenPreviewOpen] = useState(false)
  const [variableToAssign, setVariableToAssign] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (template) {
      setName(template.name)
      setIcon(normalizeIconName(template.icon || DEFAULT_TEMPLATE_ICON))
      setDescription(template.description ?? '')
      setFields(
        (template.fields ?? [])
          .sort((a, b) => a.order - b.order)
          .map((f) => {
            const ft = fieldTypeFromResponse(f.fieldType)
            const base = {
              name: f.name,
              label: f.label,
              icon: f.icon ? normalizeIconName(f.icon) : undefined,
              fieldType: ft,
              required: f.required,
              order: f.order,
              excelCell: f.excelCell ?? undefined,
              variable: f.variable ?? f.excelCell ?? undefined,
            } as FormFieldInputDto
            if (ft === 'multi_checkbox' && Array.isArray(f.options)) {
              base.options = f.options.map((o) => {
                if (typeof o === 'string') return { label: o, variable: o }
                if ('variable' in o && 'label' in o) return o as MultiCheckboxOptionDto
                // FormFieldOption format: { value, label }
                return { label: (o as { label: string; value: string }).label, variable: (o as { label: string; value: string }).value }
              })
              base.variable = undefined
            }
            return base
          })
      )
      // Si el backend envía HTML completo (texto largo), usarlo; si envía clave corta, cargaremos el HTML por fetch
      const raw = typeof template.templateHtml === 'string' ? template.templateHtml : ''
      const isFullHtml = raw.length > 400
      if (isFullHtml) {
        setHtmlContent(raw)
      } else {
        setHtmlContent(null)
      }
      const keyFromBackend = raw.trim()
      const knownKey = HTML_TEMPLATES.some((t) => t.value === keyFromBackend) ? keyFromBackend : null
      setTemplateHtmlKey(knownKey ?? HTML_TEMPLATES[0]?.value ?? '')
    } else {
      setName('')
      setIcon(DEFAULT_TEMPLATE_ICON)
      setDescription('')
      setFields([])
      setTemplateHtmlKey(HTML_TEMPLATES[0]?.value ?? '')
      setHtmlContent(null)
    }
  }, [isOpen, template])

  const createMutation = useMutation({
    mutationFn: (payload: FormTemplateCreatePayload) => createFormTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: FormTemplateCreatePayload
    }) => updateFormTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] })
      onClose()
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: FormTemplateCreatePayload = {
      name: name.trim(),
      icon: icon && icon !== NO_ICON_VALUE ? icon : undefined,
      fields: fields
        .filter((f) => f.name.trim() && f.label.trim())
        .map((f, i) => {
          const dto: FormFieldInputDto = {
            name: f.name.trim(),
            label: f.label.trim(),
            icon: f.icon?.trim() && f.icon !== NO_ICON_VALUE ? f.icon.trim() : undefined,
            fieldType: f.fieldType,
            required: !!f.required,
            order: f.order ?? i,
            excelCell: f.excelCell?.trim() || undefined,
            variable: f.fieldType !== 'multi_checkbox' ? (f.variable?.trim() || undefined) : undefined,
          }
          if (f.fieldType === 'multi_checkbox' && f.options?.length) {
            dto.options = (f.options as MultiCheckboxOptionDto[]).filter((o) => o.variable.trim())
          }
          if (f.fieldType === 'select' && f.options?.length) {
            dto.options = (f.options as FormFieldOption[]).filter((o) => o.value?.trim())
          }
          return dto
        }),
    }
    if (description.trim()) payload.description = description.trim()
    // Enviar el HTML completo de la plantilla (desde fetch en creación o desde template.templateHtml en edición)
    if (htmlContent?.trim()) payload.templateHtml = htmlContent.trim()

    if (isEdit && template) {
      updateMutation.mutate({ id: template.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: '',
        label: '',
        fieldType: 'text',
        required: false,
        order: prev.length,
      },
    ])
  }

  const updateField = (index: number, updates: Partial<FormFieldInputDto>) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== index) return f
        const merged = { ...f, ...updates }
        // Al cambiar a multi_checkbox, inicializar options y limpiar variable
        if (updates.fieldType === 'multi_checkbox' && f.fieldType !== 'multi_checkbox') {
          merged.options = []
          merged.variable = undefined
        }
        // Al cambiar a select, inicializar options vacías
        if (updates.fieldType === 'select' && f.fieldType !== 'select') {
          merged.options = []
        }
        // Al cambiar desde multi_checkbox/select a otro tipo, limpiar options
        if (updates.fieldType && !['multi_checkbox', 'select'].includes(updates.fieldType) && ['multi_checkbox', 'select'].includes(f.fieldType)) {
          merged.options = undefined
        }
        return merged
      })
    )
  }

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  const moveField = (index: number, direction: 1 | -1) => {
    const next = index + direction
    if (next < 0 || next >= fields.length) return
    setFields((prev) => {
      const copy = [...prev]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy.map((f, i) => ({ ...f, order: i }))
    })
  }

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return
    setFields((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, removed)
      return copy.map((f, i) => ({ ...f, order: i }))
    })
    setDraggedIndex(null)
  }

  const validFields = fields.filter((f) => f.name.trim() && f.label.trim())

  /** Todas las variables asignadas (individuales + opciones de multi_checkbox) */
  const allAssignedVariables = new Set<string>()
  fields.forEach((f) => {
    if (f.variable?.trim()) allAssignedVariables.add(f.variable.trim())
    if (f.fieldType === 'multi_checkbox' && f.options) {
      f.options.forEach((o) => { if (o.variable.trim()) allAssignedVariables.add(o.variable.trim()) })
    }
  })

  // Cargar HTML desde el archivo de la plantilla seleccionada (crear y editar). Así al editar se usa la versión actual del archivo para previsualizar y actualizar en la DB.
  useEffect(() => {
    if (!isOpen || !templateHtmlKey) {
      if (!isOpen) setHtmlContent(null)
      return
    }
    const path = HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.path
    if (!path) {
      setHtmlContent(null)
      return
    }
    fetch(path)
      .then((r) => r.text())
      .then(setHtmlContent)
      .catch(() => setHtmlContent(null))
  }, [isOpen, templateHtmlKey])

  const reloadHtmlFromTemplate = () => {
    if (!templateHtmlKey) return
    const path = HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.path
    if (!path) return
    setIsReloadingHtml(true)
    fetch(path)
      .then((r) => r.text())
      .then(setHtmlContent)
      .catch(() => setHtmlContent(null))
      .finally(() => setIsReloadingHtml(false))
  }

  // HTML de previsualización: reemplazar {{variable}} por «label» si está asignada, o cuadro azul clicable si no
  const templateVariables = HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.variables ?? []
  const previewHtml = (() => {
    if (!htmlContent || !templateHtmlKey) return null
    const varToLabel: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.variable?.trim() && f.label?.trim()) {
        varToLabel[f.variable.trim()] = f.label.trim()
      }
      if (f.fieldType === 'multi_checkbox' && f.options && f.label?.trim()) {
        f.options.forEach((opt) => {
          if (opt.variable.trim()) varToLabel[opt.variable.trim()] = `${f.label.trim()} → ${opt.label || opt.variable}`
        })
      }
    })
    let out = htmlContent
    const baseHref = typeof window !== 'undefined' ? `${window.location.origin}/` : ''
    if (baseHref && !out.includes('<base ')) {
      out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`)
    }
    // Estilos: azul claro semitransparente sin asignar, verde cuando tiene campo asignado
    if (!out.includes('unassigned-var-slot')) {
      const unassignedStyle = 'display:inline-block;min-width:1.2em;min-height:1em;background:rgba(147,197,253,0.5);color:#1e40af;font-size:0.75em;padding:2px 6px;border-radius:3px;cursor:pointer;margin:0 1px;border:1px solid rgba(59,130,246,0.5);'
      const assignedStyle = 'display:inline-block;min-width:1.2em;min-height:1em;background:rgba(34,197,94,0.35);color:#166534;font-size:0.75em;padding:2px 6px;border-radius:3px;margin:0 1px;border:1px solid rgba(34,197,94,0.5);'
      out = out.replace(/<head([^>]*)>/i, `<head$1><style>.unassigned-var-slot{${unassignedStyle}}.assigned-var-slot{${assignedStyle}}</style><script>document.addEventListener('click',function(e){var t=e.target.closest('.unassigned-var-slot');if(t&&t.dataset.variable){window.parent.postMessage({type:'VARIABLE_CLICK',variable:t.dataset.variable},'*');}});</script>`)
    }
    for (const variable of templateVariables) {
      const label = varToLabel[variable]
      const replacement = label
        ? `<span class="assigned-var-slot" title="${escapeHtml(label)}">${escapeHtml(label)}</span>`
        : `<span class="unassigned-var-slot" data-variable="${escapeHtml(variable)}" title="Click para asignar campo">${escapeHtml(variable)}</span>`
      out = out.replace(new RegExp(`\\{\\{${escapeRegExp(variable)}\\}\\}`, 'g'), replacement)
    }
    return out
  })()

  // Listener para clics en variables sin asignar (desde el iframe)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'VARIABLE_CLICK' && typeof e.data.variable === 'string') {
        setVariableToAssign(e.data.variable)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? t('securityForms.management.edit') : t('securityForms.management.createTemplate')}
          </h2>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              {t('securityForms.fillFormPage.cancel')}
            </Button>
            <Button
              type="submit"
              form="template-form"
              disabled={isSubmitting || validFields.length === 0 || !templateHtmlKey.trim() || !htmlContent?.trim()}
            >
              {isSubmitting
                ? isEdit
                  ? t('securityForms.management.updating')
                  : t('securityForms.management.creating')
                : t('securityForms.management.save')}
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden min-h-0">
          {/* Columna izquierda: configuración */}
          <div className="lg:col-span-2 overflow-y-auto space-y-6">
            <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t('securityForms.management.generalConfig')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('securityForms.management.templateName')} *
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={255}
                      className="rounded-lg"
                      placeholder={t('securityForms.management.templateNamePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('securityForms.management.templateIcon')}
                    </label>
                    <IconSelect
                      value={icon}
                      onChange={setIcon}
                      optional={false}
                      triggerClassName="rounded-lg h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('securityForms.management.templateDescription')}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      placeholder={t('securityForms.management.descriptionPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('securityForms.management.templateFile')}
                    </label>
                    {isEdit && htmlContent && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 px-3 py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t('securityForms.management.templateFileCurrent')}:
                        </span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {t('securityForms.management.templateHtmlLoaded', { count: htmlContent.length })}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <Select
                        value={templateHtmlKey || undefined}
                        onValueChange={setTemplateHtmlKey}
                      >
                        <SelectTrigger className="rounded-lg h-10 flex-1">
                          <SelectValue placeholder={t('securityForms.management.templateHtmlSelectPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {HTML_TEMPLATES.map((tpl) => (
                            <SelectItem key={tpl.value} value={tpl.value}>
                              {tpl.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-10 w-10"
                        title={t('securityForms.management.reloadHtml')}
                        disabled={!templateHtmlKey || isReloadingHtml}
                        onClick={reloadHtmlFromTemplate}
                      >
                        <RefreshCw className={`h-4 w-4 ${isReloadingHtml ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    {!templateHtmlKey && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        {t('securityForms.management.templateHtmlRequired')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t('securityForms.management.fieldConfig')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('securityForms.management.noFields')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('securityForms.management.addFieldsToBuild')}
                      </p>
                      <Button type="button" onClick={addField} className="mt-4 bg-blue-700 hover:bg-blue-800 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('securityForms.management.addField')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={index}
                          data-index={index}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop(index)}
                          className={`rounded-lg border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3 transition-shadow ${
                            draggedIndex === index ? 'opacity-50' : ''
                          } ${draggedIndex !== null ? 'border-dashed border-blue-400 dark:border-blue-500' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                draggable
                                onDragStart={handleDragStart(index)}
                                onDragEnd={handleDragEnd}
                                className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                                title={t('securityForms.management.dragToReorder')}
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('securityForms.management.fieldNumber', { number: index + 1 })}
                              </span>
                              {field.required && (
                                <span className="rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                  {t('securityForms.management.requiredTag')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveField(index, -1)}
                                disabled={index === 0}
                                title={t('securityForms.management.moveUp')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveField(index, 1)}
                                disabled={index === fields.length - 1}
                                title={t('securityForms.management.moveDown')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                                onClick={() => removeField(index)}
                                title={t('securityForms.management.delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t('securityForms.management.fieldNameId')}
                              </label>
                              <Input
                                value={field.name}
                                onChange={(e) => updateField(index, { name: e.target.value })}
                                maxLength={100}
                                className="rounded-lg h-9"
                                placeholder="ej: helmet"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t('securityForms.management.visibleLabel')}
                              </label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                                maxLength={255}
                                className="rounded-lg h-9"
                                placeholder="ej: Casco de seguridad"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 items-end">
                            <div className="min-w-[140px]">
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t('securityForms.management.fieldTypeLabel')}
                              </label>
                              <Select
                                value={field.fieldType}
                                onValueChange={(v) => updateField(index, { fieldType: v as FormFieldTypeApi })}
                              >
                                <SelectTrigger className="h-9 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FIELD_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {t(`securityForms.management.fieldTypes.${type}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="min-w-[180px] flex-1">
                              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                {t('securityForms.management.fieldIcon')}
                              </label>
                              <IconSelect
                                value={field.icon ?? ''}
                                onChange={(v) => updateField(index, { icon: v || undefined })}
                                optional
                                placeholder={t('securityForms.management.noIcon')}
                                triggerClassName="rounded-lg h-9"
                              />
                            </div>
                            {field.fieldType !== 'multi_checkbox' && (
                              <div className="min-w-[200px] flex-1">
                                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {t('securityForms.management.variable')}
                                </label>
                                <VariableSelect
                                  value={field.variable ?? ''}
                                  onChange={(v) => updateField(index, { variable: v || undefined })}
                                  variables={HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.variables ?? []}
                                  placeholder={t('securityForms.management.variablePlaceholder')}
                                  searchPlaceholder={t('securityForms.management.variableSearch')}
                                  triggerClassName="rounded-lg h-9 w-full"
                                  assignedVariables={new Set([...allAssignedVariables].filter((v) => v !== field.variable))}
                                />
                              </div>
                            )}
                            <label className="flex items-center gap-2 pb-2">
                              <input
                                type="checkbox"
                                checked={!!field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t('securityForms.management.requiredField')}
                              </span>
                            </label>
                          </div>
                          {/* Editor de opciones para select */}
                          {field.fieldType === 'select' && (
                            <div className="mt-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-green-700 dark:text-green-300">
                                  {t('securityForms.management.selectOptions')}
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                                  onClick={() => {
                                    const opts = [...(field.options ?? []), { value: '', label: '' }] as FormFieldOption[]
                                    updateField(index, { options: opts })
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {t('securityForms.management.addOption')}
                                </Button>
                              </div>
                              {(field.options ?? []).length === 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('securityForms.management.noOptionsYet')}
                                </p>
                              )}
                              {(field.options ?? []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 w-5 text-right shrink-0">
                                    {optIdx + 1}.
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <Input
                                      value={(opt as FormFieldOption).value || ''}
                                      onChange={(e) => {
                                        const opts = [...(field.options ?? [])]
                                        opts[optIdx] = { ...(opts[optIdx] as FormFieldOption), value: e.target.value }
                                        updateField(index, { options: opts })
                                      }}
                                      placeholder={t('securityForms.management.optionValuePlaceholder')}
                                      className="rounded-lg h-8 text-xs"
                                      maxLength={100}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Input
                                      value={(opt as FormFieldOption).label || ''}
                                      onChange={(e) => {
                                        const opts = [...(field.options ?? [])]
                                        opts[optIdx] = { ...(opts[optIdx] as FormFieldOption), label: e.target.value }
                                        updateField(index, { options: opts })
                                      }}
                                      placeholder={t('securityForms.management.optionLabelPlaceholder')}
                                      className="rounded-lg h-8 text-xs"
                                      maxLength={100}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                                    onClick={() => {
                                      const opts = (field.options ?? []).filter((_, i) => i !== optIdx) as FormFieldOption[]
                                      updateField(index, { options: opts })
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Editor de opciones para multi_checkbox */}
                          {field.fieldType === 'multi_checkbox' && (
                            <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                  {t('securityForms.management.multiCheckboxOptions')}
                                </label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                  onClick={() => {
                                    const opts: MultiCheckboxOptionDto[] = [...(field.options ?? []), { label: '', variable: '' }]
                                    updateField(index, { options: opts })
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {t('securityForms.management.addOption')}
                                </Button>
                              </div>
                              {(field.options ?? []).length === 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t('securityForms.management.noOptionsYet')}
                                </p>
                              )}
                              {(field.options ?? []).map((opt, optIdx) => {
                                const assignedExcludingSelf = new Set(
                                  [...allAssignedVariables].filter((v) => v !== opt.variable)
                                )
                                return (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 w-5 text-right shrink-0">
                                      {optIdx + 1}.
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <Input
                                        value={opt.label}
                                        onChange={(e) => {
                                          const opts = [...(field.options ?? [])]
                                          opts[optIdx] = { ...opts[optIdx], label: e.target.value }
                                          updateField(index, { options: opts })
                                        }}
                                        placeholder={t('securityForms.management.optionLabelPlaceholder')}
                                        className="rounded-lg h-8 text-xs"
                                        maxLength={100}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <VariableSelect
                                        value={opt.variable}
                                        onChange={(v) => {
                                          const opts = [...(field.options ?? [])]
                                          opts[optIdx] = { ...opts[optIdx], variable: v }
                                          updateField(index, { options: opts })
                                        }}
                                        variables={HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.variables ?? []}
                                        placeholder={t('securityForms.management.selectVariable')}
                                        searchPlaceholder={t('securityForms.management.variableSearch')}
                                        triggerClassName="rounded-lg h-8 w-full text-xs"
                                        assignedVariables={assignedExcludingSelf}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                                      onClick={() => {
                                        const opts = (field.options ?? []).filter((_, i) => i !== optIdx)
                                        updateField(index, { options: opts })
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addField}
                        variant="outline"
                        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('securityForms.management.addField')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error instanceof Error ? error.message : t('securityForms.errorLoading')}
                </p>
              )}
            </form>
          </div>

          {/* Columna derecha: vista previa del HTML */}
          <Card className="border border-gray-200 dark:border-gray-700 lg:col-span-1 overflow-hidden flex flex-col min-h-0">
            <CardHeader className="pb-2 shrink-0">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t('securityForms.management.preview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col pt-0 relative group">
              {/* BOTÓN FLOTANTE: No se mueve con el scroll */}
              {previewHtml && (
                <button
                  type="button"
                  onClick={() => setFullscreenPreviewOpen(true)}
                  className="absolute top-4 right-8 z-30 rounded-full bg-blue-600 p-2.5 shadow-xl text-white hover:bg-blue-700 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center border-2 border-white dark:border-gray-800"
                  title={t('securityForms.management.previewFullscreen')}
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              )}

              {templateHtmlKey ? (
                <div className="flex-1 min-h-[320px] rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 overflow-auto relative">
                  <iframe
                    key={`${templateHtmlKey}-${previewHtml ? 'preview' : 'raw'}`}
                    src={previewHtml ? undefined : HTML_TEMPLATES.find((t) => t.value === templateHtmlKey)?.path ?? ''}
                    srcDoc={previewHtml ?? undefined}
                    title={t('securityForms.management.preview')}
                    className="border-0 bg-white"
                    style={{ 
                      width: '1200px', 
                      height: '1500px', 
                      display: 'block' 
                    }}
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 text-center p-6">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('securityForms.management.templateHtmlSelectPlaceholder')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('securityForms.management.templateHtmlRequired')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pantalla completa de la previsualización */}
        {fullscreenPreviewOpen && previewHtml && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-2 shrink-0">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('securityForms.management.previewFullscreen')}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setFullscreenPreviewOpen(false)}
                aria-label={t('securityForms.fillFormPage.cancel')}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto p-2">
              <iframe
                key="fullscreen-preview"
                srcDoc={previewHtml}
                title={t('securityForms.management.preview')}
                className="w-full min-h-[calc(100vh-52px)] border border-gray-200 dark:border-gray-600 rounded-lg"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}

        {/* Modal: asignar variable a un campo */}
        {variableToAssign && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setVariableToAssign(null)}>
            <div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t('securityForms.management.assignVariableToField')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {variableToAssign}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {validFields.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('securityForms.management.addFieldsFirst')}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {fields.map((f, fieldIndex) => {
                      if (!f.name.trim() || !f.label.trim()) return null
                      const isAssigned = f.variable?.trim() === variableToAssign
                      return (
                        <li key={fieldIndex}>
                          <button
                            type="button"
                            className={`w-full text-left rounded-lg px-3 py-2 text-sm border transition-colors ${
                              isAssigned
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => {
                              updateField(fieldIndex, { variable: variableToAssign })
                              setVariableToAssign(null)
                            }}
                          >
                            {f.label}
                            {isAssigned && (
                              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                ✓
                              </span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" size="sm" onClick={() => setVariableToAssign(null)}>
                  {t('securityForms.fillFormPage.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
