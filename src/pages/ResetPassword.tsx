import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { authService } from '../features/auth/auth.service'
import { supabase } from '../lib/supabase'

type Stage = 'loading' | 'form' | 'success' | 'invalid'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    // We just need to verify there's a valid session
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setStage('form')
      } else {
        // Wait briefly for Supabase to process the hash
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession()
          setStage(retry.session ? 'form' : 'invalid')
        }, 1000)
      }
    }
    check()
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!password) { setError('Please enter a new password'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setIsLoading(true)
    const result = await authService.updatePassword(password)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Failed to update password')
      return
    }
    setStage('success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-accent/60" />

        <div className="p-8">
          {stage === 'loading' && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Verifying reset link...</p>
            </div>
          )}

          {stage === 'invalid' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-serif font-bold text-primary mb-2">Link expired</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This reset link has expired or is invalid. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-serif font-bold text-primary mb-2">Password updated</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your password has been changed. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors"
              >
                Go to Home
              </button>
            </div>
          )}

          {stage === 'form' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-primary">Set new password</h2>
                <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-destructive/8 border border-destructive/20 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Minimum 8 characters"
                      disabled={isLoading}
                      className="w-full h-12 pl-10 pr-11 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="Repeat your password"
                      disabled={isLoading}
                      className="w-full h-12 pl-10 pr-11 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 mt-6 bg-accent hover:bg-accent/90 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Update Password</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}