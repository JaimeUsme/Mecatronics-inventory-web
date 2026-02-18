import { useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils'

interface SignaturePadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  disabled?: boolean
  error?: string
  className?: string
  /** Etiqueta personalizada (si no se provee, usa la traducción por defecto) */
  label?: string
  /** Mostrar asterisco de requerido */
  required?: boolean
}

export function SignaturePad({ value, onChange, disabled, error, className, label, required = true }: SignaturePadProps) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const getCanvas = useCallback(() => canvasRef.current, [])
  const getCtx = useCallback(() => getCanvas()?.getContext('2d'), [getCanvas])

  const setCanvasSize = useCallback(() => {
    const canvas = getCanvas()
    if (!canvas) return
    const dpr = window.devicePixelRatio ?? 1
    const rect = canvas.getBoundingClientRect()
    const w = Math.floor(rect.width)
    const h = Math.floor(rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [getCanvas])

  useEffect(() => {
    setCanvasSize()
    const canvas = getCanvas()
    if (!canvas) return
    const ro = new ResizeObserver(setCanvasSize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [setCanvasSize, getCanvas])

  const getCoords = useCallback(
    (e: React.PointerEvent): { x: number; y: number } | null => {
      const canvas = getCanvas()
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    },
    [getCanvas]
  )

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = getCtx()
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
    },
    [getCtx]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      e.preventDefault()
      const coords = getCoords(e)
      if (!coords) return
      isDrawing.current = true
      lastPoint.current = coords
    },
    [disabled, getCoords]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current || disabled) return
      e.preventDefault()
      const coords = getCoords(e)
      if (!coords || !lastPoint.current) return
      drawLine(lastPoint.current, coords)
      lastPoint.current = coords
    },
    [disabled, getCoords, drawLine]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false
    lastPoint.current = null
    const canvas = getCanvas()
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png')
        onChange(dataUrl)
      } catch {
        onChange(null)
      }
    }
  }, [onChange, getCanvas])

  const handleClear = useCallback(() => {
    const canvas = getCanvas()
    const ctx = getCtx()
    if (canvas && ctx) {
      const dpr = window.devicePixelRatio ?? 1
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
      onChange(null)
    }
  }, [getCanvas, getCtx, onChange])

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <PenLine className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>{label || t('securityForms.fillFormPage.signature')}</span>
        {required && <span className="text-red-500">*</span>}
      </div>
      <div
        className={cn(
          'relative rounded-lg border bg-white dark:bg-gray-800',
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        )}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          className="block w-full h-40 cursor-crosshair touch-none rounded-lg"
          style={{ maxWidth: '100%' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className="absolute bottom-2 right-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="rounded-lg border-gray-300 dark:border-gray-600 text-sm"
          >
            {t('securityForms.fillFormPage.clearSignature')}
          </Button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
