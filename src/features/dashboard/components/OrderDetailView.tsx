import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Image as ImageIcon,
  Check,
  Upload,
  Send,
  MessageSquare,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
  Trash2,
  Plus,
  CalendarX,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/utils'
import { useDebounce } from '@/shared/hooks'
import type { OrderResponse, OrderMaterialUsage, OrderFeedback, OrderImage } from '../types'
import { useOrderImages, useUploadOrderImage, useDeleteOrderImage, useOrderFeedbacks, useCreateFeedback, useRescheduleOrder } from '../hooks'
import { SignatureModal } from './SignatureModal'
import { ordersService } from '../services'
import { useMaterials, useConsumeMaterials } from '@/features/inventory/hooks'
import { getAuthHeaders } from '@/shared/utils/api'
import type { MaterialResponse } from '@/features/inventory/types'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { getOrderStatusLabel } from '../utils/orderStatus'

const statusColors: Record<string, string> = {
  programada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  no_programada: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  exitosa: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  fallida: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  otra: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

function formatDate(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString)
    const dateLocale = locale === 'es' ? es : enUS
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: dateLocale })
  } catch {
    return dateString
  }
}

function formatRelativeTime(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return locale === 'es' ? 'Hoy' : 'Today'
    } else if (diffInDays === 1) {
      return locale === 'es' ? 'Hace 1 día' : '1 day ago'
    } else if (diffInDays < 7) {
      return locale === 'es' ? `Hace ${diffInDays} días` : `${diffInDays} days ago`
    } else {
      return formatDate(dateString, locale)
    }
  } catch {
    return dateString
  }
}

interface OrderDetailViewProps {
  order: OrderResponse
  onBack: () => void
}

export function OrderDetailView({ order, onBack }: OrderDetailViewProps) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { data: imagesData, isLoading: isLoadingImages } = useOrderImages(order.id)
  
  // Usar datos ya separados del backend
  const normalImages = imagesData?.images || []
  const signatureImage = imagesData?.sign || null
  // Para el lightbox, combinar todas las imágenes
  const allImages = [...normalImages, ...(signatureImage ? [signatureImage] : [])]
  const uploadImage = useUploadOrderImage(order.id)
  const deleteImage = useDeleteOrderImage(order.id)
  const [imageToDelete, setImageToDelete] = useState<OrderImage | null>(null)
  const { data: feedbacksData, isLoading: isLoadingFeedbacks } = useOrderFeedbacks(order.id)
  
  // Usar datos ya separados del backend
  const regularFeedbacks = feedbacksData?.feedbacks || []
  const materialFeedbacks = feedbacksData?.materials || []
  
  // Parsear materiales de los feedbacks de materiales
  const groupedMaterials = useMemo(() => {
    const materialMap = new Map<string, OrderMaterialUsage>()

    materialFeedbacks.forEach((feedback) => {
      if (!feedback.body) return
      
      try {
        const parsed = JSON.parse(feedback.body)
        const materialsArray = parsed.materials || []
        
        materialsArray.forEach((m: any) => {
          const existing = materialMap.get(m.materialId)
          if (existing) {
            // Sumar cantidades si el material ya existe
            materialMap.set(m.materialId, {
              ...existing,
              quantityUsed: existing.quantityUsed + (m.quantityUsed || 0),
              quantityDamaged: existing.quantityDamaged + (m.quantityDamaged || 0),
            })
          } else {
            materialMap.set(m.materialId, {
              id: feedback.id,
              materialId: m.materialId,
              materialName: m.materialName,
              materialUnit: m.materialUnit,
              quantityUsed: m.quantityUsed || 0,
              quantityDamaged: m.quantityDamaged || 0,
              createdAt: feedback.created_at,
            })
          }
        })
      } catch (e) {
        console.error('Error parsing material feedback:', e)
      }
    })

    return Array.from(materialMap.values())
  }, [materialFeedbacks])
  const createFeedback = useCreateFeedback(order.id)
  const consumeMaterials = useConsumeMaterials()
  const rescheduleOrder = useRescheduleOrder(order.id)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackKindId, setFeedbackKindId] = useState<string>('')
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleFeedback, setRescheduleFeedback] = useState('')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [isClosingOrder, setIsClosingOrder] = useState(false)

  // ID del tipo de feedback para materiales gastados
  const MATERIAL_FEEDBACK_KIND_ID = 'bd40d1ad-5b89-42a4-a70f-2ec8b2392e16'

  // Tipos de feedback hardcodeados
  const feedbackKinds = [
    { id: 'bd40d1ad-5b89-42a4-a70f-2ec8b2392e16', name: 'Finalizado' },
    { id: 'reprogramado-id', name: 'Reprogramado' },
    { id: 'otro-id', name: 'Otro' },
  ]

  // Inicializar feedbackKindId con el primer tipo disponible
  useEffect(() => {
    if (!feedbackKindId && feedbackKinds.length > 0) {
      setFeedbackKindId(feedbackKinds[0].id)
    }
  }, [feedbackKindId])

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim() || !feedbackKindId) return

    try {
      await createFeedback.mutateAsync({
        feedback: {
          body: feedbackComment.trim(),
          feedback_kind_id: feedbackKindId,
        },
      })
      setFeedbackComment('')
      setFeedbackKindId('')
    } catch (error) {
      console.error('Error al crear feedback:', error)
      // TODO: Mostrar notificación de error al usuario
    }
  }
  
  // Material gastado state
  const [materialUsageList, setMaterialUsageList] = useState<OrderMaterialUsage[]>([])
  const [materialSearch, setMaterialSearch] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialResponse | null>(null)
  const [quantityUsed, setQuantityUsed] = useState<string>('')
  const [quantityDamaged, setQuantityDamaged] = useState<string>('')
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false)
  const [isConfirmingMaterials, setIsConfirmingMaterials] = useState(false)
  
  const debouncedMaterialSearch = useDebounce(materialSearch, 400)
  const { data: materialsData } = useMaterials({
    per_page: 50,
    search: debouncedMaterialSearch || undefined,
  })
  const materials: MaterialResponse[] = materialsData?.materials ?? []
  const materialDropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMaterialDropdownOpen(false)
      }
    }

    if (isMaterialDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isMaterialDropdownOpen])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Subir cada archivo
    for (const file of Array.from(files)) {
      try {
        await uploadImage.mutateAsync(file)
      } catch (error) {
        console.error('Error al subir imagen:', error)
        // TODO: Mostrar notificación de error al usuario
      }
    }

    // Limpiar el input para permitir subir el mismo archivo de nuevo
    event.target.value = ''
  }

  const statusLabel = getOrderStatusLabel(order)
  
  const getStatusLabelText = (label: string) => {
    switch (label) {
      case 'programada':
        return t('dashboard.scheduled')
      case 'no_programada':
        return t('dashboard.unscheduled')
      case 'exitosa':
        return t('dashboard.success')
      case 'fallida':
        return t('dashboard.failure')
      default:
        return t('dashboard.allStatuses')
    }
  }

  const statusColor = statusColors[statusLabel] || statusColors.otra
  const locale = i18n.language || 'es'

  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>{t('orderDetail.backToPanel')}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ORD-{String(order.sequential_id).padStart(3, '0')}
                </h1>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {order.description || t('dashboard.noDescription')}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowRescheduleModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CalendarX className="h-4 w-4" />
                  {t('orderDetail.reschedule') || 'Reprogramar'}
                </Button>
                <span
                  className={cn(
                    'px-3 py-1 rounded-md text-sm font-medium',
                    statusColor
                  )}
                >
                  {getStatusLabelText(statusLabel)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('orderDetail.description')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.description || t('orderDetail.noDescription')}
              </p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('orderDetail.client')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {order.orderable_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('orderDetail.assignedTo')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {order.employee_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('orderDetail.address')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {order.gps_point?.full_address || t('dashboard.noDescription')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t('orderDetail.created')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(order.created_at, locale)}
                  </p>
                </div>
              </div>

              {order.end_at && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('orderDetail.dueDate')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(order.end_at, locale)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Signature Section */}
          {signatureImage && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('orderDetail.userSignature')}
                </h3>
              </div>
              <div className="flex justify-center">
                <div className="relative max-w-2xl w-full">
                  <img
                    src={signatureImage.original}
                    alt={t('orderDetail.userSignature')}
                    className="w-full h-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-4"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Images Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('orderDetail.images')}
              </h3>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center mb-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="image-upload"
                onChange={handleFileChange}
                disabled={uploadImage.isPending}
              />
              <label
                htmlFor="image-upload"
                className={cn(
                  'cursor-pointer block',
                  uploadImage.isPending && 'opacity-50 cursor-not-allowed'
                )}
              >
                {uploadImage.isPending ? (
                  <>
                    <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('orderDetail.uploadingImage')}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('orderDetail.dragDropImages')}
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Images List */}
            {isLoadingImages ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('orderDetail.loadingImages')}
                </p>
              </div>
            ) : normalImages.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {normalImages.map((image) => {
                  // Encontrar el índice real en el array completo para el lightbox
                  const realIndex = allImages.findIndex(img => img.id === image.id)
                  return (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 group border border-gray-200 dark:border-gray-700"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex(realIndex)}
                        className="w-full h-full hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <img
                          src={image.thumb}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImageToDelete(image)
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={t('orderDetail.deleteImage')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <ImageIcon className="h-5 w-5" />
                <p className="text-sm">{t('orderDetail.noImages')}</p>
              </div>
            )}
          </Card>

          {/* Image Lightbox Modal */}
          {selectedImageIndex !== null && allImages[selectedImageIndex] && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedImageIndex(null)}
            >
              <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(null)}
                  className="absolute top-4 right-4 z-10 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label={t('orderDetail.closeModal')}
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Previous Button */}
                {allImages.length > 1 && selectedImageIndex > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(selectedImageIndex - 1)
                    }}
                    className="absolute left-4 z-10 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={t('orderDetail.previousImage')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Next Button */}
                {allImages.length > 1 && selectedImageIndex < allImages.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(selectedImageIndex + 1)
                    }}
                    className="absolute right-4 z-10 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label={t('orderDetail.nextImage')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                {/* Image */}
                <div
                  className="max-w-7xl max-h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={allImages[selectedImageIndex].original}
                    alt={allImages[selectedImageIndex].filename}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                  <p className="text-white text-center mt-4 text-sm">
                    {allImages[selectedImageIndex].filename}
                  </p>
                  {allImages.length > 1 && (
                    <p className="text-white/70 text-center mt-2 text-xs">
                      {selectedImageIndex + 1} / {allImages.length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Material Usage Section */}
          {groupedMaterials.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('orderDetail.materialUsage')}
                </h3>
              </div>
              <div className="space-y-2">
                {groupedMaterials.map((material: OrderMaterialUsage, index: number) => (
                  <div
                    key={material.materialId || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {material.materialName}
                      </p>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {material.quantityUsed > 0 && (
                          <span>
                            {t('orderDetail.used')}: {material.quantityUsed} {material.materialUnit}
                          </span>
                        )}
                        {material.quantityDamaged > 0 && (
                          <span>
                            {t('orderDetail.damaged')}: {material.quantityDamaged} {material.materialUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('orderDetail.comments')}
              </h3>
            </div>

            {/* Comments List */}
            {isLoadingFeedbacks ? (
              <div className="text-center py-8 mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('orderDetail.loadingComments')}
                </p>
              </div>
            ) : regularFeedbacks.length > 0 ? (
              <div className="space-y-4 mb-4">
                {regularFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {feedback.creator?.name || t('orderDetail.anonymousUser')}
                        </p>
                        {feedback.feedback_kind?.name && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {feedback.feedback_kind.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(feedback.created_at, locale)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {feedback.body || t('orderDetail.noComment')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-4">
                <MessageSquare className="h-5 w-5" />
                <p className="text-sm">{t('orderDetail.noComments')}</p>
              </div>
            )}

            {/* Comment Input */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('orderDetail.feedbackType')}
                </label>
                <Select
                  value={feedbackKindId}
                  onValueChange={setFeedbackKindId}
                >
                  <SelectTrigger className={cn(
                    !feedbackKindId && 'border-red-500'
                  )}>
                    <SelectValue placeholder={t('orderDetail.selectFeedbackType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackKinds.map((kind) => (
                      <SelectItem key={kind.id} value={kind.id}>
                        {kind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!feedbackKindId && (
                  <p className="text-xs text-red-500">{t('orderDetail.feedbackTypeRequired')}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('orderDetail.comment')}
                </label>
                <Textarea
                  placeholder={t('orderDetail.commentPlaceholder')}
                  rows={4}
                  className="resize-none"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSubmitFeedback}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!feedbackComment.trim() || !feedbackKindId || createFeedback.isPending || isConfirmingMaterials}
              >
                <Send className="h-4 w-4 mr-2" />
                {createFeedback.isPending && !isConfirmingMaterials
                  ? t('orderDetail.sending')
                  : t('orderDetail.send')}
              </Button>
            </div>
          </Card>

          {/* Material Gastado Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('orderDetail.materialUsed')}
              </h3>
            </div>

            {/* Add Material Form */}
            <div className="mb-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('orderDetail.selectMaterial')}
                </label>
                <div className="relative" ref={materialDropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t('orderDetail.searchMaterial')}
                      value={materialSearch}
                      onChange={(e) => {
                        setMaterialSearch(e.target.value)
                        setIsMaterialDropdownOpen(true)
                      }}
                      onFocus={() => setIsMaterialDropdownOpen(true)}
                      className="pl-10"
                    />
                  </div>
                  {isMaterialDropdownOpen && materials.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                      {materials.map((material) => (
                        <button
                          key={material.id}
                          type="button"
                          onClick={() => {
                            setSelectedMaterial(material)
                            setIsMaterialDropdownOpen(false)
                            setMaterialSearch('')
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                            selectedMaterial?.id === material.id && 'bg-blue-50 dark:bg-blue-900/20'
                          )}
                        >
                          <div className="font-medium">{material.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {material.category} • {material.unit}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedMaterial && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{selectedMaterial.name}</span>
                    <span className="text-xs">({selectedMaterial.unit})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterial(null)
                        setQuantityUsed('')
                        setQuantityDamaged('')
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {selectedMaterial && (
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('orderDetail.quantityUsed')} ({selectedMaterial.unit})
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantityUsed}
                      onChange={(e) => setQuantityUsed(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('orderDetail.quantityDamaged')} ({selectedMaterial.unit})
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantityDamaged}
                      onChange={(e) => setQuantityDamaged(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => {
                        if (selectedMaterial && (quantityUsed || quantityDamaged)) {
                          const newUsage: OrderMaterialUsage = {
                            materialId: selectedMaterial.id,
                            materialName: selectedMaterial.name,
                            materialUnit: selectedMaterial.unit,
                            quantityUsed: parseFloat(quantityUsed) || 0,
                            quantityDamaged: parseFloat(quantityDamaged) || 0,
                          }
                          // Verificar si el material ya existe en la lista
                          const existingIndex = materialUsageList.findIndex(
                            (u) => u.materialId === selectedMaterial.id
                          )
                          if (existingIndex >= 0) {
                            // Actualizar si ya existe
                            const updatedList = [...materialUsageList]
                            updatedList[existingIndex] = newUsage
                            setMaterialUsageList(updatedList)
                          } else {
                            // Agregar si no existe
                            setMaterialUsageList([...materialUsageList, newUsage])
                          }
                          // Limpiar formulario
                          setSelectedMaterial(null)
                          setQuantityUsed('')
                          setQuantityDamaged('')
                          setMaterialSearch('')
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!selectedMaterial || (!quantityUsed && !quantityDamaged)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('orderDetail.addMaterial')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Material Usage List */}
            {materialUsageList.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('orderDetail.materialList')}
                </div>
                {materialUsageList.map((usage, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {usage.materialName}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {usage.quantityUsed > 0 && (
                          <span>
                            {t('orderDetail.used')}: {usage.quantityUsed} {usage.materialUnit}
                          </span>
                        )}
                        {usage.quantityDamaged > 0 && (
                          <span>
                            {t('orderDetail.damaged')}: {usage.quantityDamaged} {usage.materialUnit}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMaterialUsageList(materialUsageList.filter((_, i) => i !== index))
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {/* Confirm Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    onClick={async () => {
                      if (materialUsageList.length === 0 || isConfirmingMaterials) return

                      setIsConfirmingMaterials(true)
                      try {
                        // Crear el body en formato JSON que el backend pueda reconocer
                        const materialFeedbackBody = JSON.stringify({
                          materials: materialUsageList.map((usage) => ({
                            materialId: usage.materialId,
                            materialName: usage.materialName,
                            materialUnit: usage.materialUnit,
                            quantityUsed: usage.quantityUsed,
                            quantityDamaged: usage.quantityDamaged,
                          })),
                        })

                        // Usar el endpoint de crear feedback con el body especial
                        // Crear una nueva instancia de la mutación para no afectar el estado de createFeedback
                        const feedbackResponse = await fetch(`http://localhost:3000/orders/${order.id}/feedbacks`, {
                          method: 'POST',
                          headers: {
                            ...getAuthHeaders(),
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            feedback: {
                              body: materialFeedbackBody,
                              feedback_kind_id: MATERIAL_FEEDBACK_KIND_ID,
                            },
                            locale: i18n.language || 'es',
                          }),
                          credentials: 'include',
                        })

                        if (!feedbackResponse.ok) {
                          const errorData = await feedbackResponse.json().catch(() => ({
                            message: 'Error al crear feedback de materiales',
                          }))
                          throw new Error(errorData.message || 'Error al crear feedback de materiales')
                        }

                        // Obtener la lista actualizada de feedbacks de la respuesta
                        const updatedFeedbacks: OrderFeedback[] = await feedbackResponse.json()

                        // Actualizar el cache inmediatamente con la respuesta del servidor
                        queryClient.setQueryData(['order-feedbacks', order.id], updatedFeedbacks)

                        // Guardar la lista de materiales antes de limpiar (para el consumo)
                        const materialsToConsume = [...materialUsageList]

                        // Limpiar todo el formulario INMEDIATAMENTE después de crear el feedback
                        // Esto hace que la UI se actualice de inmediato
                        setMaterialUsageList([])
                        setSelectedMaterial(null)
                        setQuantityUsed('')
                        setQuantityDamaged('')
                        setMaterialSearch('')
                        setIsMaterialDropdownOpen(false)

                        // Solo si el feedback se creó correctamente, consumir los materiales
                        await consumeMaterials.mutateAsync({
                          materials: materialsToConsume.map((usage) => ({
                            materialId: usage.materialId,
                            materialName: usage.materialName,
                            materialUnit: usage.materialUnit,
                            quantityUsed: usage.quantityUsed,
                            quantityDamaged: usage.quantityDamaged,
                          })),
                          serviceOrderId: order.id,
                        })
                      } catch (error) {
                        console.error('Error al confirmar materiales:', error)
                        // TODO: Mostrar notificación de error al usuario
                      } finally {
                        setIsConfirmingMaterials(false)
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isConfirmingMaterials || consumeMaterials.isPending}
                  >
                    {isConfirmingMaterials || consumeMaterials.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('orderDetail.confirmingMaterials')}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {t('orderDetail.confirmMaterials')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <Package className="h-5 w-5" />
                <p className="text-sm">{t('orderDetail.noMaterialsUsed')}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Close Order Button */}
          {order.state !== 'completed' && order.state !== 'cancelled' && order.state !== 'closed' && (
            <Card className="p-6">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowSignatureModal(true)}
                disabled={isClosingOrder}
              >
                {isClosingOrder ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('orderDetail.closingOrder')}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    {t('orderDetail.closeOrder')}
                  </>
                )}
              </Button>
            </Card>
          )}

          {/* Action History - Removed as it's not in the new API structure */}
        </div>
      </div>

      {/* Modal de firma digital */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={async (signatureDataUrl) => {
          try {
            setIsClosingOrder(true)
            // Por defecto, cerrar como exitosa. Si necesitas permitir elegir, puedes agregar un selector
            await ordersService.closeOrder(order.id, signatureDataUrl, 'success')
            // Invalidar las queries para refrescar los datos
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['myOrders'] })
            queryClient.invalidateQueries({ queryKey: ['order-details', order.id] })
            queryClient.invalidateQueries({ queryKey: ['orderCounts'] })
            queryClient.invalidateQueries({ queryKey: ['myOrderCounts'] })
            setShowSignatureModal(false)
            // Opcional: mostrar mensaje de éxito o redirigir
          } catch (error) {
            console.error('Error al cerrar la orden:', error)
            // El error se manejará con toast si está configurado
          } finally {
            setIsClosingOrder(false)
          }
        }}
        isLoading={isClosingOrder}
        orderNumber={`ORD-${String(order.sequential_id).padStart(3, '0')}`}
      />

      {/* Modal de confirmación para eliminar imagen */}
      {imageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-800">
            <div className="px-6 pt-6 pb-6">
              {/* Header con icono */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {t('orderDetail.deleteImageTitle')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setImageToDelete(null)}
                      className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label={t('orderDetail.close')}
                      disabled={deleteImage.isPending}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="pl-16">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {t('orderDetail.confirmDeleteImage')}
                </p>
                {imageToDelete.filename && (
                  <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('orderDetail.imageFilename')}:{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {imageToDelete.filename}
                      </span>
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setImageToDelete(null)}
                    disabled={deleteImage.isPending}
                    className="min-w-[100px]"
                  >
                    {t('orderDetail.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!imageToDelete) return
                      try {
                        const imageIndex = allImages.findIndex(
                          (img: OrderImage) => img.id === imageToDelete.id
                        )
                        await deleteImage.mutateAsync(imageToDelete.id)
                        setImageToDelete(null)
                        // Si la imagen eliminada era la seleccionada, cerrar el lightbox
                        if (selectedImageIndex === imageIndex) {
                          setSelectedImageIndex(null)
                        } else if (
                          selectedImageIndex !== null &&
                          selectedImageIndex > imageIndex
                        ) {
                          // Ajustar el índice si la imagen eliminada estaba antes de la seleccionada
                          setSelectedImageIndex(selectedImageIndex - 1)
                        }
                      } catch (error) {
                        console.error('Error al eliminar imagen:', error)
                        // TODO: Mostrar notificación de error
                      }
                    }}
                    disabled={deleteImage.isPending}
                    className="min-w-[100px]"
                  >
                    {deleteImage.isPending
                      ? t('orderDetail.deleting')
                      : t('orderDetail.delete')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 rounded-xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <CalendarX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('orderDetail.rescheduleOrder') || 'Reprogramar Orden'}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('orderDetail.rescheduleMessage') || 'Por favor, proporciona un motivo para reprogramar esta orden.'}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t('orderDetail.feedback') || 'Motivo'}
                  </label>
                  <Textarea
                    placeholder={t('orderDetail.reschedulePlaceholder') || 'Ej: Usuario no está en la casa'}
                    rows={4}
                    className="resize-none"
                    value={rescheduleFeedback}
                    onChange={(e) => setRescheduleFeedback(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRescheduleModal(false)
                      setRescheduleFeedback('')
                    }}
                    disabled={rescheduleOrder.isPending}
                  >
                    {t('orderDetail.cancel') || 'Cancelar'}
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await rescheduleOrder.mutateAsync(rescheduleFeedback.trim())
                        setShowRescheduleModal(false)
                        setRescheduleFeedback('')
                        // Mostrar mensaje de éxito (podrías usar un toast aquí)
                        alert(t('orderDetail.rescheduleSuccess') || 'Orden reprogramada exitosamente')
                      } catch (error) {
                        console.error('Error al reprogramar orden:', error)
                        alert(t('orderDetail.rescheduleError') || 'Error al reprogramar la orden')
                      }
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!rescheduleFeedback.trim() || rescheduleOrder.isPending}
                  >
                    {rescheduleOrder.isPending
                      ? (t('orderDetail.processing') || 'Procesando...')
                      : (t('orderDetail.confirmReschedule') || 'Confirmar Reprogramación')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

