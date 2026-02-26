import React, { Fragment } from 'react';
import { Check } from 'lucide-react';
interface Step {
  id: number;
  label: string;
}
interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}
export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;
          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10
                    ${isCompleted ? 'bg-[#008080] border-[#008080] text-white animate-check-in' : isCurrent ? 'bg-white border-[#008080] text-[#008080]' : 'bg-white border-slate-300 text-slate-400'}
                  `}>

                  {isCompleted ?
                  <Check className="w-5 h-5" /> :

                  <span>{step.id}</span>
                  }
                </div>
                <div className="absolute top-10 w-32 text-center">
                  <span
                    className={`text-xs font-medium ${isCurrent ? 'text-[#008080]' : 'text-slate-500'}`}>

                    {step.label}
                  </span>
                </div>
              </div>

              {!isLast &&
              <div className="relative flex-1 h-0.5 w-16 sm:w-24 mx-2 bg-slate-200 overflow-hidden">
                  {isCompleted &&
                <div className="absolute inset-0 bg-[#008080] progress-bar-animated" />
                }
                </div>
              }
            </Fragment>);

        })}
      </div>
    </div>);

}