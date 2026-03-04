import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { RequestFormData } from './request.types'
import { fullRequestSchema } from './request.schema'
import { requestService } from './request.service'
import Step1Personal from './steps/Step1Personal'
import Step2School from './steps/Step2School'
import Step3Payment from './steps/Step3Payment'
import Step4Documents from './steps/Step4Documents'
import Step5Confirm from './steps/Step5Confirm'
import { ChevronLeft, ChevronRight, Send } from 'lucide-react'

const TOTAL_STEPS = 5

const STEP_FIELDS = {
  1: ['fullName', 'email', 'phone'] as const,
  2: ['schoolName', 'program', 'studySemester'] as const,
  3: ['amount', 'currency', 'schoolAccountName', 'schoolAccountNumber', 'schoolBankName'] as const,
  4: [] as const,
  5: [] as const,
}

interface RequestFormProps {
  onSuccess?: () => void
}

export default function RequestForm({ onSuccess }: RequestFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors }
  } = useForm<RequestFormData>({
    resolver: zodResolver(fullRequestSchema),
    mode: 'onChange',
    defaultValues: {
      currency: 'NGN'
    }
  })

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS]
    
    let isValid = true
    if (fieldsToValidate.length > 0) {
      isValid = await trigger(fieldsToValidate as any)
    }
    
    if (isValid && currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const submitForm = async (data: RequestFormData) => {
    setIsSubmitting(true)
    
    try {
      const isValid = await trigger()
      
      if (!isValid) {
        alert('Please check all fields and try again.')
        setIsSubmitting(false)
        return
      }
      
      const result = await requestService.submitRequest({ ...data, userId: user?.id ?? null })
      
      if (result.success) {
        if (onSuccess) {
          onSuccess()
        }
        navigate('/submitted')
      } else {
        alert(`Submission failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal register={register} errors={errors} />
      case 2:
        return <Step2School register={register} errors={errors} />
      case 3:
        return <Step3Payment register={register} errors={errors} />
      case 4:
        return <Step4Documents register={register} errors={errors} setValue={setValue} />
      case 5:
        return <Step5Confirm watch={watch} register={register} errors={errors} />
      default:
        return null
    }
  }

  return (
    <div className="py-8 px-6 md:px-10">
      
      {/* Wizard Header - Refined */}
      <div className="mb-8">
        {/* Step Text + Progress Percentage */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-xs font-semibold text-accent">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        
        {/* Thin Progress Bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step Circles - Smaller, Tighter */}
        <div className="flex items-center justify-between px-1">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs
                transition-all duration-300
                ${currentStep >= step 
                  ? 'bg-accent text-white shadow-sm' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step}
              </div>
              <span className={`
                text-[10px] mt-1.5 hidden md:block font-medium
                ${currentStep >= step ? 'text-accent' : 'text-muted-foreground'}
              `}>
                {step === 1 && 'Personal'}
                {step === 2 && 'School'}
                {step === 3 && 'Payment'}
                {step === 4 && 'Documents'}
                {step === 5 && 'Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons - Sticky Bottom Bar */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/50">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 h-11 px-5 font-medium text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 h-11 px-6 bg-accent hover:bg-accent/90 text-white font-semibold text-sm rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 h-11 px-6 bg-accent hover:bg-accent/90 text-white font-semibold text-sm rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Need help? Contact us at{' '}
          <a href="mailto:support@hopecatalyst.com" className="text-accent hover:underline font-medium">
            support@hopecatalyst.com
          </a>
        </p>
      </div>
    </div>
  )
}