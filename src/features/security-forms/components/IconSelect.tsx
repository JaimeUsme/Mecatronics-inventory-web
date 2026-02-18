import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils'
import { FormTemplateIcon, LUCIDE_ICON_NAMES } from '../lib/lucide-icon'

const DEFAULT_TEMPLATE_ICON = 'file-text'

/** Valor que indica "sin icono" en un campo; no se envía al API. */
export const NO_ICON_VALUE = '__none__'

interface IconSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Si true, incluye opción "Sin icono" y usa NO_ICON_VALUE. */
  optional?: boolean
  className?: string
  triggerClassName?: string
}

export function IconSelect({
  value,
  onChange,
  placeholder,
  optional = false,
  className,
  triggerClassName,
}: IconSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const effectiveValue =
    value && value !== NO_ICON_VALUE ? value : optional ? NO_ICON_VALUE : DEFAULT_TEMPLATE_ICON

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return LUCIDE_ICON_NAMES
    return LUCIDE_ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [search])

  const handleSelect = (iconName: string) => {
    onChange(iconName === NO_ICON_VALUE ? '' : iconName)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={triggerClassName}
          aria-label={placeholder}
        >
          {effectiveValue === NO_ICON_VALUE ? (
            <span className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-600" aria-hidden />
          ) : (
            <FormTemplateIcon
              icon={effectiveValue}
              className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-auto p-0', className)} align="start">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('securityForms.management.searchIcon')}
              className="pl-8 h-9 rounded-lg"
            />
          </div>
        </div>
        <div className="p-2 max-h-[280px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {optional && (
              <button
                type="button"
                onClick={() => handleSelect(NO_ICON_VALUE)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={placeholder ?? 'Sin icono'}
              >
                —
              </button>
            )}
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  effectiveValue === name
                    ? 'bg-blue-100 dark:bg-blue-900/40 ring-1 ring-blue-500'
                    : ''
                }`}
                title={name}
              >
                <FormTemplateIcon
                  icon={name}
                  className="h-4 w-4 text-gray-700 dark:text-gray-300"
                />
              </button>
            ))}
          </div>
          {filteredIcons.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('securityForms.management.noIconsFound')}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DEFAULT_TEMPLATE_ICON }
