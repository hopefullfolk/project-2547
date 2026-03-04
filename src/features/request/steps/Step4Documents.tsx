import { useState } from 'react'
import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form'
import type { RequestFormData } from '../request.types'
import { Upload, FileText, X } from 'lucide-react'

interface Step4DocumentsProps {
  register: UseFormRegister<RequestFormData>
  errors: FieldErrors<RequestFormData>
  setValue: UseFormSetValue<RequestFormData>
}

export default function Step4Documents({ setValue }: Step4DocumentsProps) {
  const [admissionFileName, setAdmissionFileName] = useState<string>('')
  const [invoiceFileName, setInvoiceFileName] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'admission' | 'invoice') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'admission') {
        setAdmissionFileName(file.name)
        setValue('admissionLetter', file)
      } else {
        setInvoiceFileName(file.name)
        setValue('feeInvoice', file)
      }
    }
  }

  const clearFile = (type: 'admission' | 'invoice') => {
    if (type === 'admission') {
      setAdmissionFileName('')
      setValue('admissionLetter', null)
    } else {
      setInvoiceFileName('')
      setValue('feeInvoice', null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-serif font-semibold text-primary mb-2">
          Upload Documents
        </h3>
        <p className="text-muted-foreground">
          Please upload the required documents for verification
        </p>
      </div>

      {/* Admission Letter */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Admission Letter
          <span className="text-muted-foreground ml-2 text-xs font-normal">(PDF, JPG, PNG - Max 5MB)</span>
        </label>
        
        {!admissionFileName ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 'admission')}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-foreground truncate max-w-xs">
                {admissionFileName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => clearFile('admission')}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        )}
      </div>

      {/* Fee Invoice */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          School Fee Invoice
          <span className="text-muted-foreground ml-2 text-xs font-normal">(PDF, JPG, PNG - Max 5MB)</span>
        </label>
        
        {!invoiceFileName ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(e, 'invoice')}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-foreground truncate max-w-xs">
                {invoiceFileName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => clearFile('invoice')}
              className="p-1 hover:bg-destructive/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-destructive" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Note:</strong> Both documents are required for your application to be processed. 
          Ensure the documents are clear and legible.
        </p>
      </div>
    </div>
  )
}