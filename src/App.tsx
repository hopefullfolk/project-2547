import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/public/Home'
import CheckStatus from './pages/public/CheckStatus'
import DebugPage from './pages/public/DebugPage'
import AuthModal from './components/auth/AuthModal'
import RequestModal from './components/ui/RequestModal'
import StatusModal from './components/ui/StatusModal'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import RequestReview from './pages/admin/RequestReview'
import AdminUsers from './pages/admin/AdminUsers'

type Intent = 'submit' | 'check' | null

function AppRoutes() {
  const { user } = useAuth()

  const [authOpen, setAuthOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<Intent>(null)

  // Called when user clicks a CTA button
  const handleIntent = (intent: Intent) => {
    if (!user) {
      setPendingIntent(intent)
      setAuthOpen(true)
    } else {
      openModal(intent)
    }
  }

  const openModal = (intent: Intent) => {
    if (intent === 'submit') setRequestOpen(true)
    if (intent === 'check') setStatusOpen(true)
  }

  // Called by AuthModal after successful login/signup
  const handleAuthSuccess = () => {
    setAuthOpen(false)
    if (pendingIntent) {
      setTimeout(() => openModal(pendingIntent), 300)
      setPendingIntent(null)
    }
  }

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={
          <>
            <Header onOpenModal={() => handleIntent('submit')} />
            <Home onOpenModal={() => handleIntent('submit')} />
            <Footer />
          </>
        } />
        <Route path="/check-status" element={
          <>
            <Header onOpenModal={() => handleIntent('submit')} />
            <CheckStatus />
            <Footer />
          </>
        } />
        <Route path="/debug" element={<DebugPage />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/requests/:id" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}><RequestReview /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}><AdminUsers /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => { setAuthOpen(false); setPendingIntent(null) }}
        onSuccess={handleAuthSuccess}
      />
      <RequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        onCheckStatus={() => { setRequestOpen(false); setTimeout(() => setStatusOpen(true), 300) }}
      />
      <StatusModal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        onSubmitNew={() => { setStatusOpen(false); setTimeout(() => setRequestOpen(true), 300) }}
      />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}