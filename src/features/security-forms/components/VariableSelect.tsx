import { useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/utils'

interface VariableSelectProps {
  value: string
  onChange: (value: string) => void
  variables: string[]
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  triggerClassName?: string
  /** Variables ya asignadas a otros campos (para deshabilitar o marcar) */
  assignedVariables?: Set<string>
}

export function VariableSelect({
  value,
  onChange,
  variables,
  placeholder = 'Seleccionar variable...',
  searchPlaceholder = 'Buscar variable...',
  className,
  triggerClassName,
  assignedVariables,
}: VariableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return variables
    const q = search.trim().toLowerCase()
    return variables.filter((v) => v.toLowerCase().includes(q))
  }, [variables, search])

  const isAssigned = (v: string) => assignedVariables?.has(v) ?? false
  const isAssignedToOther = (v: string) => value !== v && isAssigned(v)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between font-normal', triggerClassName, className)}
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>
        <ul className="max-h-[240px] overflow-auto p-1">
          {filtered.length === 0 ? (
            <li className="py-4 text-center text-sm text-muted-foreground">
              No hay variables
            </li>
          ) : (
            filtered.map((v) => (
              <li key={v}>
                <button
                  type="button"
                  className={cn(
                    'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent',
                    value === v && 'bg-accent',
                    isAssignedToOther(v) && 'opacity-60'
                  )}
                  onClick={() => {
                    if (isAssignedToOther(v)) return
                    onChange(value === v ? '' : v)
                    setOpen(false)
                    setSearch('')
                  }}
                  disabled={isAssignedToOther(v)}
                >
                  {value === v ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <span className="truncate">{v}</span>
                  {isAssignedToOther(v) && (
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">
                      (asignada)
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
