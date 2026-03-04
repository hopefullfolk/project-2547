import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2.5">
            {label}
            {props.required && <span className="text-accent ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full min-h-[120px] px-4 py-3 bg-white border rounded-xl transition-all resize-y text-sm
            ${error 
              ? 'border-destructive/60 focus:border-destructive focus:ring-4 focus:ring-destructive/10' 
              : 'border-border/60 focus:border-accent focus:ring-4 focus:ring-accent/10'
            }
            placeholder:text-muted-foreground/50
            disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

export default TextArea