import React from 'react'
import { Check } from 'lucide-react'

export interface Step {
  id: number
  title: string
  shortTitle: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepId: number) => void
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      {/* Mobile step status */}
      <div className="sm:hidden flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-[#252B26]">
          Step {currentStep} of {steps.length}: <span className="text-forest-700 font-bold">{steps[currentStep - 1]?.title}</span>
        </span>
        <span className="text-[#687068] font-mono text-[11px] font-semibold">
          {Math.round((currentStep / steps.length) * 100)}% Complete
        </span>
      </div>

      {/* Progress track */}
      <div className="hidden sm:flex items-center justify-between relative py-2">
        {/* Connecting line */}
        <div
          className="absolute top-6 -translate-y-1/2 h-1 bg-[#DEDFD8] rounded-full z-0"
          style={{
            left: `${100 / (2 * steps.length)}%`,
            right: `${100 / (2 * steps.length)}%`,
          }}
        />
        <div
          className="absolute top-6 -translate-y-1/2 h-1 bg-forest-600 transition-all duration-300 rounded-full z-0 shadow-sm"
          style={{
            left: `${100 / (2 * steps.length)}%`,
            width: `${((currentStep - 1) / (steps.length - 1)) * (100 - (100 / steps.length))}%`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = onStepClick && step.id <= currentStep

          return (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center group flex-1 ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isClickable && onStepClick && onStepClick(step.id)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-forest-600 text-white shadow-[2px_2px_6px_rgba(22,132,71,0.28),-2px_-2px_6px_rgba(255,255,255,0.7)] border border-white/30'
                    : isCurrent
                    ? 'bg-[#F4F4F0] text-forest-700 border-2 border-forest-600 shadow-neu-sm'
                    : 'bg-[#EEEEEA] text-[#8C948C] border border-[#DEDFD8]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium tracking-tight transition-colors text-center px-1 truncate max-w-[120px] ${
                  isCurrent
                    ? 'text-forest-700 font-bold'
                    : isCompleted
                    ? 'text-[#252B26] font-semibold'
                    : 'text-[#8C948C]'
                }`}
              >
                {step.shortTitle}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar on mobile */}
      <div className="sm:hidden w-full bg-[#E3E4DE] h-2 rounded-full overflow-hidden border border-[#DEDFD8]">
        <div
          className="bg-forest-600 h-full transition-all duration-300 rounded-full shadow-sm"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default StepIndicator
