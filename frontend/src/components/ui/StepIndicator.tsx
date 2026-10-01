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
        <span className="font-semibold text-slate-700">
          Step {currentStep} of {steps.length}: <span className="text-forest-700">{steps[currentStep - 1]?.title}</span>
        </span>
        <span className="text-slate-400 font-mono text-[11px]">
          {Math.round((currentStep / steps.length) * 100)}% Complete
        </span>
      </div>

      {/* Progress track */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-forest-600 transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isClickable = onStepClick && step.id <= currentStep

          return (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center group ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
              onClick={() => isClickable && onStepClick && onStepClick(step.id)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-forest-600 text-white shadow-sm ring-4 ring-forest-50'
                    : isCurrent
                    ? 'bg-white text-forest-700 border-2 border-forest-600 shadow-md ring-4 ring-forest-50'
                    : 'bg-white text-slate-400 border border-slate-300 group-hover:border-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium tracking-tight transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-forest-800 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.shortTitle}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar on mobile */}
      <div className="sm:hidden w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-forest-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
