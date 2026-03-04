import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenModal: () => void
  onCheckStatus: () => void
  onOpenAuth: () => void
}

export default function MobileMenu({ isOpen, onClose, onOpenModal, onCheckStatus, onOpenAuth }: MobileMenuProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          onClose()
        }, 100)
      } else {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        onClose()
      }
    } else {
      navigate(href)
      onClose()
    }
  }

  const handleSubmitClick = () => {
    onClose()
    onOpenModal()
  }

  const handleCheckStatusClick = () => {
    onClose()
    onCheckStatus()
  }

  const handleAuthClick = () => {
    onClose()
    onOpenAuth()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-strong z-50 md:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <span className="font-serif font-semibold text-lg text-primary">Menu</span>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col p-6 space-y-1">
              <button
                onClick={() => handleNavClick('#how-it-works')}
                className="px-4 py-3 text-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all font-medium text-left"
              >
                How It Works
              </button>
              <button
                onClick={handleCheckStatusClick}
                className="px-4 py-3 text-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all font-medium text-left"
              >
                Check My Status
              </button>

              <div className="h-px bg-border my-4" />

              <button
                onClick={handleAuthClick}
                className="px-4 py-3 text-foreground hover:text-accent hover:bg-accent/5 rounded-lg transition-all font-medium text-left"
              >
                Sign In / Sign Up
              </button>
              <button
                onClick={handleSubmitClick}
                className="px-4 py-3 bg-accent text-white hover:bg-accent/90 rounded-lg transition-all font-semibold text-center"
              >
                Submit Request
              </button>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}