import { DynamicIcon, iconNames, type IconName } from 'lucide-react/dynamic'
import { FileText } from 'lucide-react'

/**
 * Convierte un nombre de icono en PascalCase o camelCase a kebab-case
 * para que coincida con los nombres de Lucide (ej: FileCheck -> file-check).
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Nombre de icono válido para DynamicIcon (debe existir en iconNames).
 */
const validIconNames = new Set(iconNames as string[])

/** Lista ordenada de nombres de iconos Lucide para usar en selects (sin cadenas vacías). */
export const LUCIDE_ICON_NAMES = [...(iconNames as string[])].filter(Boolean).sort((a, b) => a.localeCompare(b))

/**
 * Resuelve el nombre de icono que viene del backend (string) al formato
 * que espera Lucide (kebab-case). Si no es válido, devuelve 'file-text'.
 */
export function normalizeIconName(icon: string): string {
  if (!icon || typeof icon !== 'string') return 'file-text'
  const trimmed = icon.trim()
  const kebab = toKebabCase(trimmed)
  if (validIconNames.has(kebab)) return kebab
  // Por si el backend ya envía en kebab-case
  if (validIconNames.has(trimmed.toLowerCase())) return trimmed.toLowerCase()
  return 'file-text'
}

interface FormTemplateIconProps {
  icon: string
  className?: string
}

/**
 * Icono para una plantilla de formulario. Usa Lucide DynamicIcon con el nombre
 * que viene del backend; si no existe, muestra FileText.
 */
export function FormTemplateIcon({ icon, className }: FormTemplateIconProps) {
  const name = normalizeIconName(icon)
  return (
    <DynamicIcon
      name={name as IconName}
      className={className}
      fallback={() => <FileText className={className} />}
    />
  )
}
