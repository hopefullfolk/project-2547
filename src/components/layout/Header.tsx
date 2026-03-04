import { motion } from 'framer-motion'
import { useState } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import MobileMenu from '../ui/MobileMenu'

interface HeaderProps {
  onOpenModal: () => void
  onCheckStatus: () => void
  onOpenAuth: () => void
}

export default function Header({ onOpenModal, onCheckStatus, onOpenAuth }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/15 backdrop-blur-2xl border-b border-white/30"
      >
        <div className="max-w-[1200px] mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">

          {/* Logo — img tag pointing to /logo.svg in public */}
          <a href="/" className="flex items-center -ml-1">
            <img src="/logo.svg" alt="Hope Catalyst" className="h-9 w-auto" />
          </a>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-12">
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, '#how-it-works')}
              className="relative text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
            <button
              onClick={onCheckStatus}
              className="relative text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 group"
            >
              Check My Status
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Right — user icon only */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 text-white relative ${
                  user ? 'bg-white/20 hover:bg-white/30' : 'hover:bg-white/10'
                }`}
                aria-label="Account"
                title={user ? `Signed in as ${user.email}` : 'Sign in'}
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
                {/* Green dot when logged in */}
                {user && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-white/30" />
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenModal={onOpenModal}
        onCheckStatus={onCheckStatus}
        onOpenAuth={onOpenAuth}
      />
    </>
  )
}