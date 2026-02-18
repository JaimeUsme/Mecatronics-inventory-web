import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { Download, Search, Calendar, Eye, HelpCircle, FileDown } from 'lucide-react'
import { DashboardLayout } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { SECURITY_FORMS_API_URL } from '@/shared/constants'
import { getFormReport, getFormTemplates, exportFormPdf } from '../services/form-templates.service'
import type { FormReportItem } from '../types'

const ALL_TEMPLATES_VALUE = '__all__'

/** Formatea una fecha YYYY-MM-DD como fecha local (evita desfase por UTC). */
function formatDateCell(dateStr: string, locale: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return dateStr
    const date = new Date(y, m - 1, d)
    const loc = locale.startsWith('es') ? es : enUS
    return format(date, 'dd/MM/yyyy', { locale: loc })
  } catch {
    return dateStr
  }
}

export function FormReviewPage() {
  const { t, i18n } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [formTypeId, setFormTypeId] = useState<string>(ALL_TEMPLATES_VALUE)
  const [search, setSearch] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: templates } = useQuery({
    queryKey: ['form-templates'],
    queryFn: getFormTemplates,
    enabled: !!SECURITY_FORMS_API_URL,
  })

  const { data: responses = [], isLoading, error } = useQuery({
    queryKey: ['forms-report', dateFrom, dateTo, formTypeId, search],
    queryFn: () =>
      getFormReport({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        templateId: formTypeId === ALL_TEMPLATES_VALUE ? undefined : formTypeId,
        searchName: search.trim() || undefined,
      }),
    enabled: !!SECURITY_FORMS_API_URL,
  })

  const handleExport = () => {
    // TODO: exportar a CSV/Excel
  }

  const handleView = (item: FormReportItem) => {
    // TODO: navegar a detalle o abrir modal
    console.log('View', item.formId)
  }

  const handleDownloadPdf = async (formId: string) => {
    setDownloadingId(formId)
    try {
      const { blob, filename } = await exportFormPdf(formId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('securityForms.review.downloadPdfError')
      window.alert(message)
    } finally {
      setDownloadingId(null)
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
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('securityForms.review.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('securityForms.review.subtitle')}
              </p>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="shrink-0 rounded-lg border-gray-300 dark:border-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('securityForms.review.export')}
            </Button>
          </header>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-100/50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('securityForms.review.from')}
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 rounded-lg border-gray-300 pr-9 dark:border-gray-600"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('securityForms.review.to')}
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 rounded-lg border-gray-300 pr-9 dark:border-gray-600"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('securityForms.review.formType')}
                </label>
                <Select value={formTypeId} onValueChange={setFormTypeId}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder={t('securityForms.review.allForms')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_TEMPLATES_VALUE}>{t('securityForms.review.allForms')}</SelectItem>
                    {(templates ?? []).map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('securityForms.review.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('securityForms.review.searchPlaceholder')}
                    className="h-10 rounded-lg border-gray-300 pl-9 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-400">
                {error instanceof Error ? error.message : t('securityForms.errorLoading')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {t('securityForms.review.date')}
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {t('securityForms.review.formTypeColumn')}
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {t('securityForms.review.responsible')}
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {t('securityForms.review.document')}
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {t('securityForms.review.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          {t('securityForms.review.noResults')}
                        </td>
                      </tr>
                    ) : (
                      responses.map((row) => (
                        <tr
                          key={row.formId}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                            {formatDateCell(row.date, i18n.language)}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {row.templateName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {row.responsibleName}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {row.document ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(row)}
                                className="rounded-lg border-gray-300 dark:border-gray-600"
                              >
                                <Eye className="h-4 w-4 mr-1.5" />
                                {t('securityForms.review.view')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(row.formId)}
                                disabled={downloadingId === row.formId}
                                className="rounded-lg border-gray-300 dark:border-gray-600"
                              >
                                {downloadingId === row.formId ? (
                                  <span className="h-4 w-4 mr-1.5 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                                ) : (
                                  <FileDown className="h-4 w-4 mr-1.5" />
                                )}
                                {t('securityForms.review.downloadPdf')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

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
