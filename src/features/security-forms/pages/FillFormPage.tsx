import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { getFormTemplates, submitForm } from '../services/form-templates.service'
import { FormFieldWidget } from '../components/fields/FormFieldWidgets'
import { SignaturePad } from '../components/SignaturePad'
import type { FormTemplateResponseDto, FormFieldResponseDto, FormValues, MultiCheckboxValue } from '../types'

export function FillFormPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const templateFromState = (location.state as { template?: FormTemplateResponseDto })?.template
  const { data: templates } = useQuery({
    queryKey: ['form-templates'],
    queryFn: getFormTemplates,
    enabled: !templateFromState,
  })

  const template = useMemo(() => {
    if (templateFromState?.id === templateId) return templateFromState
    return templates?.find((t) => t.id === templateId)
  }, [templateId, templateFromState, templates])

  const sortedFields = useMemo(() => {
    const fields = template?.fields ?? []
    return [...fields].sort((a, b) => a.order - b.order)
  }, [template?.fields])

  const buildInitialValues = (fields: FormFieldResponseDto[]): FormValues => {
    const vals: FormValues = {}
    fields.forEach((f) => {
      if (f.fieldType === 'multi_checkbox') {
        const variables: string[] = Array.isArray(f.options)
          ? f.options.map((o) => {
              if (typeof o === 'string') return o
              if ('variable' in o) return (o as { variable: string }).variable
              return (o as { value: string }).value
            })
          : []
        const obj: MultiCheckboxValue = {}
        variables.forEach((k) => { obj[k] = false })
        vals[f.name] = obj
      } else if (f.fieldType === 'boolean') vals[f.name] = undefined
      else if (f.fieldType === 'clock') vals[f.name] = '--:--'
      else if (f.fieldType === 'number') vals[f.name] = undefined
      else if (f.fieldType === 'checkbox') vals[f.name] = false
      else if (f.fieldType === 'select') vals[f.name] = ''
      else vals[f.name] = ''
    })
    return vals
  }

  const initialValues = useMemo(() => buildInitialValues(sortedFields), [sortedFields])

  const [values, setValues] = useState<FormValues>(initialValues)
  const [signature, setSignature] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when template changes
  useEffect(() => {
    if (!template) return
    setValues(buildInitialValues(sortedFields))
    setSignature(null)
    setErrors({})
  }, [template?.id])

  const setFieldValue = (fieldName: string, value: string | number | boolean | MultiCheckboxValue) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }))
    if (errors[fieldName]) setErrors((prev) => ({ ...prev, [fieldName]: '' }))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    sortedFields.forEach((field) => {
      if (!field.required) return
      const v = values[field.name]
      if (field.fieldType === 'signature') {
        if (!v || (typeof v === 'string' && v.trim() === '')) {
          next[field.name] = t('securityForms.fillFormPage.requiredField')
        }
        return
      }
      if (v === undefined || v === null || v === '') {
        next[field.name] = t('securityForms.fillFormPage.requiredField')
      }
      if (field.fieldType === 'boolean' && field.required && (v !== true && v !== false)) {
        next[field.name] = t('securityForms.fillFormPage.requiredField')
      }
      if (field.fieldType === 'clock' && field.required && (!v || v === '--:--')) {
        next[field.name] = t('securityForms.fillFormPage.requiredField')
      }
    })
    // Solo requerir firma standalone si no hay campos de tipo signature en el template
    if (!hasSignatureFields) {
      if (!signature || signature.trim() === '') {
        next.signature = t('securityForms.fillFormPage.signatureRequired')
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const payload = {
        templateId: templateId!,
        responses: sortedFields.map((f) => {
          if (f.fieldType === 'multi_checkbox') {
            return {
              fieldId: f.id,
              optionsResponse: (values[f.name] ?? {}) as MultiCheckboxValue,
            }
          }
          if (f.fieldType === 'checkbox') {
            return {
              fieldId: f.id,
              value: values[f.name] === true ? 'checked' : '' 
            };
          }
          return {
            fieldId: f.id,
            value: values[f.name] === undefined || values[f.name] === null
              ? ''
              : String(values[f.name]),
          }
        }),
        ...(hasSignatureFields ? {} : { signature: signature! }),
      }
      await submitForm(payload)
      navigate('/dashboard/security-forms', { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : t('securityForms.fillFormPage.submitError') })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!templateId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-600 dark:text-red-400">{t('securityForms.fillFormPage.notFound')}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/security-forms')}>
            {t('securityForms.fillFormPage.backToList')}
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  const hasSignatureFields = sortedFields.some((f) => f.fieldType === 'signature')

  const isFullWidth = (f: FormFieldResponseDto) =>
    f.fieldType === 'textarea' || f.fieldType === 'boolean' || f.fieldType === 'multi_checkbox' || f.fieldType === 'signature' || f.fieldType === 'clock'

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-100 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 md:py-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => navigate('/dashboard/security-forms')}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('securityForms.fillFormPage.backToList')}
          </Button>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6 md:p-8">
            <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{template.description}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('securityForms.latestVersion')}: v{template.version}
              </p>
            </header>

            {sortedFields.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">{t('securityForms.fillFormPage.noFields')}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {sortedFields.map((field: FormFieldResponseDto) => (
                    <div
                      key={field.id}
                      className={isFullWidth(field) ? 'sm:col-span-2' : ''}
                    >
                      <FormFieldWidget
                        field={field}
                        value={values[field.name]}
                        onChange={(v) => setFieldValue(field.name, v)}
                        error={errors[field.name]}
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                </div>
                {!hasSignatureFields && (
                  <div className="sm:col-span-2 pt-2">
                    <SignaturePad
                      value={signature}
                      onChange={setSignature}
                      disabled={isSubmitting}
                      error={errors.signature}
                    />
                  </div>
                )}
                {errors.form && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
                )}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {isSubmitting ? t('securityForms.fillFormPage.submitting') : t('securityForms.fillFormPage.submit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => navigate('/dashboard/security-forms')}
                    className="rounded-lg border-gray-300 dark:border-gray-600"
                  >
                    {t('securityForms.fillFormPage.cancel')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
