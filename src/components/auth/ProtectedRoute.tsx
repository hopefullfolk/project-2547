import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../features/auth/auth.service'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  /** Where to redirect if not authenticated */
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // Role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(user.role)) {
      // Wrong role — send them to their correct home
      const correctPath = user.role === 'user' ? '/' : '/admin/dashboard'
      return <Navigate to={correctPath} replace />
    }
  }

  return <>{children}</>
}