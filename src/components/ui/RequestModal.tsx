import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import Stepper, { Step } from './Stepper'
import { requestService } from '../../features/request/request.service'
import { useAuth } from '../../context/AuthContext'

/* ─── Schema ─── */

const requestSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  schoolName: z.string().min(2, 'School name is required'),
  program: z.string().min(2, 'Program is required'),
  studySemester: z.string().min(1, 'Please select your year of study'),
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().default('NGN'),
  schoolAccountName: z.string().min(2, 'Account name is required'),
  schoolAccountNumber: z.string().min(5, 'Account number is required'),
  schoolBankName: z.string().min(2, 'Bank name is required'),
  schoolSortCode: z.string().optional(),
  additionalNotes: z.string().optional(),
})

type FormData = z.infer<typeof requestSchema>

const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  1: ['fullName', 'email', 'phone'],
  2: ['schoolName', 'program', 'studySemester'],
  3: ['amount', 'currency', 'schoolAccountName', 'schoolAccountNumber', 'schoolBankName'],
  4: [],
  5: [],
}

/* ─── Reusable Form Components ─── */

function FormInput({
  label,
  error,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full h-12 px-4 rounded-xl border bg-white text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all ${
          error ? 'border-red-400' : 'border-border/60'
        }`}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

function FormSelect({
  label,
  error,
  required,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className={`w-full h-12 px-4 rounded-xl border bg-white text-foreground focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all ${
          error ? 'border-red-400' : 'border-border/60'
        }`}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}

/* ─── File Upload Card ─── */

function FileUploadCard({
  label,
  description,
  file,
  onFileChange,
  onRemove,
}: {
  label: string
  description: string
  file: File | null
  onFileChange: (file: File) => void
  onRemove: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileChange(e.target.files[0])
    e.target.value = ''
  }

  if (file) {
    return (
      <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-accent/5 border border-accent/20">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 text-accent flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
        </div>
        <button type="button" onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all">
      <Upload className="w-6 h-6 text-muted-foreground/60 mb-2" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/60 mt-1">{description}</span>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleChange} />
    </label>
  )
}

/* ─── Modal ─── */

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckStatus?: () => void
}

export default function RequestModal({ isOpen, onClose, onCheckStatus }: RequestModalProps) {
  const { user } = useAuth()
  const [admissionLetter, setAdmissionLetter] = useState<File | null>(null)
  const [feeInvoice, setFeeInvoice] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, watch, trigger, reset, formState: { errors } } = useForm<FormData, unknown, FormData>({
    resolver: zodResolver(requestSchema) as any,
    mode: 'onChange',
    defaultValues: {
      currency: 'NGN',
      email: user?.email ?? '',
    },
  })

  const handleClose = () => {
    reset()
    setAdmissionLetter(null)
    setFeeInvoice(null)
    setSubmitError(null)
    setSubmitted(false)
    onClose()
  }

  const validateStep = useCallback(
    async (nextStep: number, currentStep: number): Promise<boolean> => {
      if (nextStep <= currentStep) return true
      const fields = STEP_FIELDS[currentStep]
      if (!fields || fields.length === 0) return true
      return trigger(fields)
    },
    [trigger]
  )

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const duplicateCheck = await requestService.checkDuplicate(data.email)
      if (duplicateCheck?.isDuplicate) {
        setSubmitError('You already have an active request. Please wait for it to be reviewed before submitting another.')
        setIsSubmitting(false)
        return
      }

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        schoolName: data.schoolName,
        program: data.program,
        studySemester: data.studySemester,
        amount: data.amount,
        currency: data.currency,
        schoolAccountName: data.schoolAccountName,
        schoolAccountNumber: data.schoolAccountNumber,
        schoolSortCode: data.schoolSortCode || '',
        schoolBankName: data.schoolBankName,
        admissionLetter,
        feeInvoice,
        additionalNotes: data.additionalNotes || '',
        userId: user?.id,
      }

      const result = await requestService.submitRequest(payload as any)

      if (result.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formValues = watch()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 flex items-end sm:items-center justify-center min-h-full sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full sm:max-w-2xl"
            >
              <div className="hidden sm:flex justify-end mb-3">
                <button onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[100dvh] sm:max-h-[82vh] overflow-y-auto scrollbar-hide sm:rounded-2xl rounded-t-2xl relative">
                <button onClick={handleClose}
                  className="sm:hidden absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>

                {/* ── Success screen ── */}
                {submitted ? (
                  <div className="bg-white p-10 sm:p-14 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-primary mb-2">You're all set!</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
                      Your scholarship request has been received. We'll review it and notify you by email within a few days.
                    </p>
                    {onCheckStatus && (
                      <button
                        onClick={() => { handleClose(); setTimeout(onCheckStatus, 300) }}
                        className="w-full max-w-xs h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors mb-3">
                        Check My Request Status
                      </button>
                    )}
                    <button onClick={handleClose}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {submitError && (
                      <div className="mx-6 sm:mx-10 lg:mx-14 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">{submitError}</p>
                          <button type="button" onClick={() => setSubmitError(null)}
                            className="text-xs text-red-600 hover:text-red-800 mt-1 underline">Dismiss</button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                      <Stepper
                        initialStep={1}
                        onFinalStepCompleted={() => handleSubmit(onSubmit)()}
                        nextButtonText="Continue"
                        backButtonText="Back"
                        validateStep={validateStep}
                        isSubmitting={isSubmitting}
                      >
                        <Step>
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-serif font-semibold text-primary mb-1.5">Personal Information</h2>
                              <p className="text-sm text-muted-foreground">Let's start with your basic details</p>
                            </div>
                            <div className="space-y-5">
                              <FormInput label="Full Name" placeholder="Enter your full name" required error={errors.fullName?.message} {...register('fullName')} />
                              <FormInput label="Email Address" type="email" placeholder="you@example.com" required error={errors.email?.message} {...register('email')} />
                              <FormInput label="Phone Number" type="tel" placeholder="+234 800 000 0000" required error={errors.phone?.message} {...register('phone')} />
                            </div>
                          </div>
                        </Step>

                        <Step>
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-serif font-semibold text-primary mb-1.5">School Information</h2>
                              <p className="text-sm text-muted-foreground">Tell us about your institution and program</p>
                            </div>
                            <div className="space-y-5">
                              <FormInput label="School Name" placeholder="e.g. University of Lagos" required error={errors.schoolName?.message} {...register('schoolName')} />
                              <FormInput label="Program / Course of Study" placeholder="e.g. Computer Science" required error={errors.program?.message} {...register('program')} />
                              <FormSelect label="Year of Study" required error={errors.studySemester?.message} {...register('studySemester')}>
                                <option value="">Select year</option>
                                <option value="1">Year 1</option>
                                <option value="2">Year 2</option>
                                <option value="3">Year 3</option>
                                <option value="4">Year 4</option>
                                <option value="5">Year 5</option>
                                <option value="postgraduate">Postgraduate</option>
                              </FormSelect>
                            </div>
                          </div>
                        </Step>

                        <Step>
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-serif font-semibold text-primary mb-1.5">Payment Details</h2>
                              <p className="text-sm text-muted-foreground">School fee amount and payment information</p>
                            </div>
                            <div className="space-y-5">
                              <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Amount Needed" type="number" placeholder="150000" required error={errors.amount?.message} {...register('amount')} />
                                <FormSelect label="Currency" required error={errors.currency?.message} {...register('currency')}>
                                  <option value="NGN">NGN (₦)</option>
                                  <option value="USD">USD ($)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="EUR">EUR (€)</option>
                                </FormSelect>
                              </div>
                              <FormInput label="School Account Name" placeholder="Account name for school fees" required error={errors.schoolAccountName?.message} {...register('schoolAccountName')} />
                              <FormInput label="School Account Number" placeholder="0123456789" required error={errors.schoolAccountNumber?.message} {...register('schoolAccountNumber')} />
                              <FormInput label="School Bank Name" placeholder="e.g. First Bank" required error={errors.schoolBankName?.message} {...register('schoolBankName')} />
                              <FormInput label="Sort Code (optional)" placeholder="e.g. 011" error={errors.schoolSortCode?.message} {...register('schoolSortCode')} />
                            </div>
                          </div>
                        </Step>

                        <Step>
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-serif font-semibold text-primary mb-1.5">Upload Documents</h2>
                              <p className="text-sm text-muted-foreground">Upload supporting documents for your request</p>
                            </div>
                            <div className="space-y-5">
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">Admission Letter</p>
                                <FileUploadCard label="Upload admission letter" description="PDF, JPG, PNG — max 5MB" file={admissionLetter} onFileChange={setAdmissionLetter} onRemove={() => setAdmissionLetter(null)} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-2">Fee Invoice / Breakdown</p>
                                <FileUploadCard label="Upload fee invoice" description="PDF, JPG, PNG — max 5MB" file={feeInvoice} onFileChange={setFeeInvoice} onRemove={() => setFeeInvoice(null)} />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground/70">Documents help us verify and process your request faster. Both are optional but recommended.</p>
                          </div>
                        </Step>

                        <Step>
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-serif font-semibold text-primary mb-1.5">Review & Submit</h2>
                              <p className="text-sm text-muted-foreground">Please review your information before submitting</p>
                            </div>
                            <div className="space-y-4">
                              <ReviewSection title="Personal">
                                <ReviewRow label="Name" value={formValues.fullName} />
                                <ReviewRow label="Email" value={formValues.email} />
                                <ReviewRow label="Phone" value={formValues.phone} />
                              </ReviewSection>
                              <ReviewSection title="School">
                                <ReviewRow label="School" value={formValues.schoolName} />
                                <ReviewRow label="Program" value={formValues.program} />
                                <ReviewRow label="Year" value={formValues.studySemester === 'postgraduate' ? 'Postgraduate' : formValues.studySemester ? `Year ${formValues.studySemester}` : ''} />
                              </ReviewSection>
                              <ReviewSection title="Payment">
                                <ReviewRow label="Amount" value={formValues.amount ? `${formValues.currency} ${Number(formValues.amount).toLocaleString()}` : ''} />
                                <ReviewRow label="Account" value={formValues.schoolAccountName} />
                                <ReviewRow label="Account #" value={formValues.schoolAccountNumber} />
                                <ReviewRow label="Bank" value={formValues.schoolBankName} />
                                {formValues.schoolSortCode && <ReviewRow label="Sort Code" value={formValues.schoolSortCode} />}
                              </ReviewSection>
                              <ReviewSection title="Documents">
                                <ReviewRow label="Admission Letter" value={admissionLetter?.name || 'Not uploaded'} />
                                <ReviewRow label="Fee Invoice" value={feeInvoice?.name || 'Not uploaded'} />
                              </ReviewSection>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-foreground mb-2">Additional Notes (optional)</label>
                              <textarea rows={3} placeholder="Anything else you'd like us to know?" {...register('additionalNotes')}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all resize-none" />
                            </div>
                          </div>
                        </Step>
                      </Stepper>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/30 overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/20">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      </div>
      <div className="divide-y divide-border/20">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
  )
}