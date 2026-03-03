import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { authService } from '../../features/auth/auth.service'

type Tab = 'login' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: Tab
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const reset = () => {
    setEmail('')
    setPassword('')
    setError('')
    setShowPassword(false)
    setVerificationSent(false)
    setForgotMode(false)
    setResetSent(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setError('')
    setPassword('')
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setIsLoading(true)
    setError('')

    const result = await authService.signIn(email, password)

    if (!result.success) {
      setError(result.error ?? 'Login failed')
      setIsLoading(false)
      return
    }

    const path = authService.getRedirectPath(result.user!.role)
    handleClose()
    navigate(path)
    setIsLoading(false)
  }

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setIsLoading(true)
    setError('')

    const result = await authService.signUp(email, password)

    if (!result.success) {
      setError(result.error ?? 'Signup failed')
      setIsLoading(false)
      return
    }

    if (result.needsVerification) {
      setVerificationSent(true)
    } else {
      // Auto-signed in (email confirmation disabled)
      const session = await authService.getSession()
      if (session.user) {
        const path = authService.getRedirectPath(session.user.role)
        handleClose()
        navigate(path)
      }
    }
    setIsLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above first')
      return
    }
    setIsLoading(true)
    setError('')
    const result = await authService.resetPassword(email)
    setIsLoading(false)
    if (!result.success) {
      setError(result.error ?? 'Failed to send reset email')
      return
    }
    setResetSent(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-accent/60" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary">
                  {forgotMode ? 'Reset Password' : tab === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {forgotMode
                    ? "We'll send a reset link to your email"
                    : tab === 'login'
                    ? 'Sign in to check your request status'
                    : 'Sign up to submit and track your request'}
                </p>
              </div>

              {/* Verification sent state */}
              {verificationSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-primary text-lg mb-2">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
                    Click it to activate your account.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
                  >
                    Got it
                  </button>
                </motion.div>
              ) : resetSent ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-primary text-lg mb-2">Reset link sent</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Check <span className="font-medium text-foreground">{email}</span> for the reset link.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false) }}
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
                  >
                    Back to login
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Tabs — only show when not in forgot mode */}
                  {!forgotMode && (
                    <div className="flex bg-muted/50 rounded-xl p-1 mb-6">
                      {(['login', 'signup'] as Tab[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => switchTab(t)}
                          className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${
                            tab === t
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-3 bg-destructive/8 border border-destructive/20 rounded-xl flex items-start gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && (forgotMode ? handleForgotPassword() : tab === 'login' ? handleLogin() : handleSignup())}
                          placeholder="you@example.com"
                          disabled={isLoading}
                          className="w-full h-12 pl-10 pr-4 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Password — hidden in forgot mode */}
                    {!forgotMode && (
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError('') }}
                            onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())}
                            placeholder={tab === 'signup' ? 'Minimum 8 characters' : '••••••••'}
                            disabled={isLoading}
                            className="w-full h-12 pl-10 pr-11 rounded-xl border border-border/60 bg-white text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Forgot password link — only on login tab */}
                        {tab === 'login' && (
                          <div className="flex justify-end mt-1.5">
                            <button
                              type="button"
                              onClick={() => { setForgotMode(true); setError('') }}
                              className="text-xs text-accent hover:text-accent/80 transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={forgotMode ? handleForgotPassword : tab === 'login' ? handleLogin : handleSignup}
                    disabled={isLoading}
                    className="w-full h-12 mt-6 bg-accent hover:bg-accent/90 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {forgotMode ? 'Send Reset Link' : tab === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Forgot mode — back link */}
                  {forgotMode && (
                    <button
                      type="button"
                      onClick={() => { setForgotMode(false); setError('') }}
                      className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                    >
                      ← Back to sign in
                    </button>
                  )}

                  {/* Footer note */}
                  {!forgotMode && (
                    <p className="text-center text-xs text-muted-foreground mt-5">
                      {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                      <button
                        onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
                        className="text-accent hover:text-accent/80 font-semibold transition-colors"
                      >
                        {tab === 'login' ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}