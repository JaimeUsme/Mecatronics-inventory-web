import * as React from 'react'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { FormTemplateIcon } from '../../lib/lucide-icon'
import { SignaturePad } from '../SignaturePad'
import type { FormFieldResponseDto, FormFieldType, MultiCheckboxValue, MultiCheckboxOptionDto, FormFieldOption } from '../../types'
import { cn } from '@/shared/utils'

export interface FormFieldWidgetProps {
  field: FormFieldResponseDto
  value: string | number | boolean | MultiCheckboxValue | undefined
  onChange: (value: string | number | boolean | MultiCheckboxValue) => void
  error?: string
  disabled?: boolean
}

const inputBaseClass =
  'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500 dark:focus:border-blue-500'
const labelWrapperClass = 'flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
const errorClass = 'mt-1.5 text-sm text-red-600 dark:text-red-400'
const iconClass = 'h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0'

function FieldLabel({ field }: { field: FormFieldResponseDto }) {
  return (
    <label htmlFor={field.id} className={labelWrapperClass}>
      <FormTemplateIcon
        icon={field.icon ?? 'file-text'}
        className={iconClass}
      />
      <span>{field.label}</span>
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

export function TextFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const strValue = typeof value === 'string' ? value : ''
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <Input
        id={field.id}
        type="text"
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        disabled={disabled}
        placeholder={field.label}
        className={cn(inputBaseClass, error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500')}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function EmailFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const strValue = typeof value === 'string' ? value : ''
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <Input
        id={field.id}
        type="email"
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        disabled={disabled}
        placeholder="ejemplo@correo.com"
        className={cn(inputBaseClass, error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500')}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function NumberFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const numValue = value === '' || value === undefined ? '' : Number(value)
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <Input
        id={field.id}
        type="number"
        value={numValue}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? (undefined as unknown as number) : Number(v))
        }}
        required={field.required}
        disabled={disabled}
        className={cn(inputBaseClass, error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500')}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function TextareaFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const strValue = typeof value === 'string' ? value : ''
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <Textarea
        id={field.id}
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        disabled={disabled}
        placeholder={field.label}
        rows={4}
        className={cn(
          'min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
          error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
        )}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function DateFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const dateValue = typeof value === 'string' && value ? value.slice(0, 10) : ''
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="relative">
        <Input
          id={field.id}
          type="date"
          value={dateValue}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          className={cn(inputBaseClass, 'pr-10', error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500')}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <FormTemplateIcon icon={field.icon ?? 'calendar'} className="h-4 w-4" />
        </span>
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

const BOOLEAN_OPTIONS: Array<{ value: boolean | undefined; label: string }> = [
  { value: true, label: 'Sí' },
  { value: false, label: 'No' },
  { value: undefined, label: 'N/A' },
]

export function BooleanFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  return (
    <div className="space-y-1">
      <div className={labelWrapperClass}>
        <FormTemplateIcon icon={field.icon ?? 'toggle-left'} className={iconClass} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {BOOLEAN_OPTIONS.map((opt) => {
          const isSelected =
            opt.value === undefined
              ? (value !== true && value !== false)
              : value === opt.value
          return (
            <button
              key={String(opt.value)}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value as boolean)}
              className={cn(
                'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-600 dark:text-white'
                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function SelectFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const options = (field.options ?? []) as FormFieldOption[]
  const valueStr = value === undefined || value === null ? '' : String(value)
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <Select
        value={valueStr}
        onValueChange={(v) => onChange(v)}
        required={field.required}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.id}
          className={cn(
            inputBaseClass,
            'flex items-center justify-between',
            error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
          )}
        >
          <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function ClockFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="relative">
        <Input
          id={field.id}
          type="time"
          value={value as string ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          className={cn(
            inputBaseClass,
            'pr-10 [appearance:none] [&::-webkit-calendar-picker-indicator]:dark:invert',
            error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-500'
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <FormTemplateIcon icon={field.icon ?? 'clock'} className="h-4 w-4" />
        </span>
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function MultiCheckboxFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  // Normalizar opciones: pueden venir como MultiCheckboxOptionDto[], FormFieldOption[] o string[]
  const options: MultiCheckboxOptionDto[] = Array.isArray(field.options)
    ? field.options.map((o) => {
        if (typeof o === 'string') return { label: o, variable: o }
        if ('variable' in o) return o as MultiCheckboxOptionDto
        return { label: (o as { label: string; value: string }).label, variable: (o as { label: string; value: string }).value }
      })
    : []
  const checked = (typeof value === 'object' && value !== null ? value : {}) as MultiCheckboxValue

  const toggle = (variable: string) => {
    const next = { ...checked, [variable]: !checked[variable] }
    onChange(next)
  }

  return (
    <div className="space-y-1">
      <FieldLabel field={field} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((opt) => (
          <label
            key={opt.variable}
            className={cn(
              'flex items-center gap-2 cursor-pointer select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="checkbox"
              checked={!!checked[opt.variable]}
              onChange={() => toggle(opt.variable)}
              disabled={disabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label || opt.variable}</span>
          </label>
        ))}
      </div>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function CheckboxFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const isChecked = !!value; // Fuerza a boolean

  return (
    <div className="space-y-1">
      <label
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500"
        )}
      >
        <input
          id={field.id}
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        <div className="flex items-center gap-2">
          <FormTemplateIcon icon={field.icon ?? 'check-square'} className={iconClass} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      </label>
      {error && <p className={errorClass}>{error}</p>}
    </div>
  )
}

export function SignatureFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const strValue = typeof value === 'string' && value ? value : null
  return (
    <SignaturePad
      value={strValue}
      onChange={(dataUrl) => onChange(dataUrl ?? '')}
      disabled={disabled}
      error={error}
      label={field.label}
      required={field.required}
    />
  )
}

const WIDGET_MAP: Record<FormFieldType, React.ComponentType<FormFieldWidgetProps>> = {
  text: TextFieldWidget,
  email: EmailFieldWidget,
  number: NumberFieldWidget,
  textarea: TextareaFieldWidget,
  date: DateFieldWidget,
  boolean: BooleanFieldWidget,
  select: SelectFieldWidget,
  multi_checkbox: MultiCheckboxFieldWidget,
  signature: SignatureFieldWidget,
  clock: ClockFieldWidget,
  checkbox: CheckboxFieldWidget,
}

export function FormFieldWidget({ field, value, onChange, error, disabled }: FormFieldWidgetProps) {
  const type = field.fieldType in WIDGET_MAP ? field.fieldType : 'text'
  const Widget = WIDGET_MAP[type as FormFieldType] ?? TextFieldWidget
  return (
    <Widget
      field={field}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
    />
  )
}
