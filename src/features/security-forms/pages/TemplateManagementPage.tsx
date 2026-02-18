import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Plus, Power, PowerOff, Pencil, Trash2, ChevronDown, HelpCircle } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { SECURITY_FORMS_API_URL } from '@/shared/constants'
import { FormTemplateIcon } from '../lib/lucide-icon'
import { TemplateFormModal } from '../components/TemplateFormModal'
import { getFormTemplates, patchTemplateActive } from '../services/form-templates.service'
import type { FormTemplateResponseDto } from '../types'

function formatLastUpdate(createdAt: string, locale: string): string {
  try {
    const date = new Date(createdAt)
    const loc = locale.startsWith('es') ? es : enUS
    return format(date, 'd/M/yyyy', { locale: loc })
  } catch {
    return '—'
  }
}

export function TemplateManagementPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FormTemplateResponseDto | null>(null)

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['form-templates'],
    queryFn: getFormTemplates,
    enabled: !!SECURITY_FORMS_API_URL,
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      patchTemplateActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] })
    },
    onError: (err) => {
      window.alert(err instanceof Error ? err.message : 'Error al cambiar el estado')
    },
  })

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setFormModalOpen(true)
  }

  const handleToggleStatus = (template: FormTemplateResponseDto) => {
    toggleActiveMutation.mutate({ id: template.id, isActive: !template.isActive })
  }

  const handleEdit = (template: FormTemplateResponseDto) => {
    setEditingTemplate(template)
    setFormModalOpen(true)
  }

  const handleDelete = (template: FormTemplateResponseDto) => {
    if (window.confirm(t('securityForms.management.deleteConfirm', { name: template.name }))) {
      // TODO: llamar API para eliminar
      console.log('Delete', template.id)
    }
  }

  if (!SECURITY_FORMS_API_URL) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {t('securityForms.configRequired')}
          </p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-full bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('securityForms.management.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('securityForms.management.subtitle')}
              </p>
            </div>
            <Button
              onClick={handleCreateTemplate}
              className="shrink-0 rounded-lg bg-blue-800 px-4 py-2.5 font-medium text-white hover:bg-blue-900 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t('securityForms.management.createTemplate')}
            </Button>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
              {error instanceof Error ? error.message : t('securityForms.errorLoading')}
            </div>
          ) : (
            <ul className="space-y-4">
              {(templates ?? []).map((template) => (
                <li
                  key={template.id}
                  className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FormTemplateIcon
                          icon={template.icon}
                          className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {template.name}
                          </h2>
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium text-white ${
                              template.isActive
                                ? 'bg-emerald-600 dark:bg-emerald-600'
                                : 'bg-gray-500 dark:bg-gray-600'
                            }`}
                          >
                            {template.isActive
                              ? t('securityForms.management.active')
                              : t('securityForms.management.inactive')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </p>
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {t('securityForms.management.version')}: v{template.version}
                          {' • '}
                          {t('securityForms.management.sectionsCount', {
                            count: 1,
                          })}
                          {' • '}
                          {t('securityForms.management.fieldsCount', {
                            count: template.fields?.length ?? 0,
                          })}
                          {' • '}
                          {t('securityForms.management.lastUpdate')}:{' '}
                          {formatLastUpdate(template.createdAt, i18n.language)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedId === template.id ? 'rotate-180' : ''
                            }`}
                          />
                          {t('securityForms.management.viewDetails')}
                        </button>
                        {expandedId === template.id && template.fields && template.fields.length > 0 && (
                          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              {t('securityForms.management.fieldsList')}
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                              {[...template.fields]
                                .sort((a, b) => a.order - b.order)
                                .map((f) => (
                                  <li key={f.id}>
                                    {f.label} ({f.fieldType})
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(template)}
                        disabled={
                          toggleActiveMutation.isPending &&
                          toggleActiveMutation.variables?.id === template.id
                        }
                        className={
                          template.isActive
                            ? 'border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-950/30'
                            : 'border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                        }
                      >
                        {toggleActiveMutation.isPending &&
                        toggleActiveMutation.variables?.id === template.id ? (
                          <span className="h-4 w-4 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                        ) : template.isActive ? (
                          <PowerOff className="h-4 w-4 mr-1.5" />
                        ) : (
                          <Power className="h-4 w-4 mr-1.5" />
                        )}
                        {template.isActive
                          ? t('securityForms.management.deactivate')
                          : t('securityForms.management.activate')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <Pencil className="h-4 w-4 mr-1.5" />
                        {t('securityForms.management.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template)}
                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        {t('securityForms.management.delete')}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && (!templates || templates.length === 0) && (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('securityForms.noForms')}
            </p>
          )}
        </div>

        <TemplateFormModal
          isOpen={formModalOpen}
          onClose={() => { setFormModalOpen(false); setEditingTemplate(null) }}
          template={editingTemplate ?? undefined}
        />

        <button
          type="button"
          className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 shadow hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label={t('securityForms.management.help')}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </DashboardLayout>
  )
}
