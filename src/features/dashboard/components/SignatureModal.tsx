import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Card } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { SignaturePad } from './SignaturePad'
import { cn } from '@/shared/utils'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (signatureDataUrl: string) => void
  isLoading?: boolean
  orderNumber?: string
}

export function SignatureModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  orderNumber,
}: SignatureModalProps) {
  const { t } = useTranslation()
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (signatureDataUrl) {
      onConfirm(signatureDataUrl)
    }
  }

  const handleClose = () => {
    setSignatureDataUrl(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 pt-6 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('orderDetail.signatureTitle')}
              </h3>
              {orderNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('orderDetail.signatureSubtitle', { orderNumber })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('orderDetail.close')}
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Signature Pad */}
          <div className="mb-6">
            <SignaturePad
              onSignatureChange={setSignatureDataUrl}
              width={600}
              height={250}
            />
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {t('orderDetail.signatureInstructions')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('orderDetail.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!signatureDataUrl || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('orderDetail.processing')}
                </>
              ) : (
                t('orderDetail.confirmSignature')
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

