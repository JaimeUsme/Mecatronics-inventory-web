import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { SECURITY_FORMS_API_URL } from '@/shared/constants'
import { FormTemplateIcon } from '../lib/lucide-icon'
import { getFormTemplates } from '../services/form-templates.service'
import type { FormTemplateResponseDto } from '../types'

type FormStatus = 'signed_today' | 'pending' | 'not_filled'

function getStatus(template: FormTemplateResponseDto): FormStatus {
  if (template.diligencedByMeToday) return 'signed_today'
  return 'not_filled'
}

function StatusBadge({ status }: { status: FormStatus }) {
  const { t } = useTranslation()
  if (status === 'signed_today') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400">
        <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {t('securityForms.status.signedToday')}
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-400">
        <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('securityForms.status.pending')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-400 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <span className="flex h-4 w-4 items-center justify-center text-gray-500 dark:text-gray-400 font-bold leading-none">!</span>
      {t('securityForms.status.notFilled')}
    </span>
  )
}

export function SecurityFormsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['form-templates'],
    queryFn: getFormTemplates,
    enabled: !!SECURITY_FORMS_API_URL,
  })

  const activeTemplates = templates?.filter((t) => t.isActive) ?? []

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-full">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            {t('securityForms.title')}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {t('securityForms.subtitle')}
          </p>
        </header>

        {!SECURITY_FORMS_API_URL ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-4 py-3 text-center text-sm text-amber-800 dark:text-amber-200">
            {t('securityForms.configRequired')}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40 px-4 py-3 text-center text-sm text-red-800 dark:text-red-200">
            {error instanceof Error ? error.message : t('securityForms.errorLoading')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeTemplates.map((template) => {
              const status = getStatus(template)
              return (
                <div
                  key={template.id}
                  className="flex flex-col items-center rounded-xl bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="mb-4 flex justify-center">
                    <FormTemplateIcon
                      icon={template.icon}
                      className="h-12 w-12 text-gray-700 dark:text-gray-300 stroke-[1.5]"
                    />
                  </div>
                  <h2 className="text-center text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {template.name}
                  </h2>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-1 min-h-[2.5rem]">
                    {template.description}
                  </p>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-5">
                    {t('securityForms.latestVersion')}: v{template.version}
                  </p>
                  <Button
                    className="w-full max-w-[200px] bg-blue-800 hover:bg-blue-900 text-white min-h-10 touch-manipulation"
                    onClick={() => navigate(`/dashboard/security-forms/fill/${template.id}`, { state: { template } })}
                  >
                    {t('securityForms.fillForm')}
                  </Button>
                  <div className="mt-4 flex justify-center">
                    <StatusBadge status={status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && !error && activeTemplates.length === 0 && SECURITY_FORMS_API_URL && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            {t('securityForms.noForms')}
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
