import { Check } from 'lucide-react'
import { cn } from '@/shared/utils'

interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
}

export function WizardHeader({ currentStep, totalSteps }: WizardHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted &&
                      'bg-green-500 border-green-500 text-white',
                    isCurrent &&
                      'bg-blue-600 border-blue-600 text-white',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step}</span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    isCompleted
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

