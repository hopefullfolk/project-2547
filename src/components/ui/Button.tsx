import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: ReactNode
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'h-12 px-6 font-semibold rounded-lg transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-accent hover:bg-accent/90 text-white hover:shadow-medium',
    secondary: 'bg-secondary hover:bg-secondary/80 text-primary',
    outline: 'bg-white border-2 border-border hover:border-accent hover:text-accent text-foreground'
  }
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}