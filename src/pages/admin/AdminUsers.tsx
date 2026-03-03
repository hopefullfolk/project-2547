import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, ShieldOff, User, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../features/admin/admin.service'
import type { AdminProfile } from '../../features/admin/admin.service'
import { formatDate } from '../../lib/utils'

const ROLE_CFG = {
  user:        { label: 'User',        bg: 'bg-muted/50',       color: 'text-muted-foreground'  },
  admin:       { label: 'Admin',       bg: 'bg-blue-50',        color: 'text-blue-600'          },
  super_admin: { label: 'Super Admin', bg: 'bg-accent/10',      color: 'text-accent'            },
}

export default function AdminUsers() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [filtered, setFiltered] = useState<AdminProfile[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    adminService.getAllProfiles().then(p => { setProfiles(p); setIsLoading(false) })
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(profiles); return }
    const q = search.toLowerCase()
    setFiltered(profiles.filter(p =>
      p.email.toLowerCase().includes(q) ||
      (p.full_name ?? '').toLowerCase().includes(q)
    ))
  }, [profiles, search])

  const toggleAdmin = async (profile: AdminProfile) => {
    if (!user) return
    if (profile.role === 'super_admin') {
      setMsg('Cannot modify a super admin role')
      return
    }
    const newRole = profile.role === 'admin' ? 'user' : 'admin'
    const action = newRole === 'admin' ? 'Grant admin role to' : 'Revoke admin role from'
    if (!window.confirm(`${action} ${profile.email}?`)) return

    setActionId(profile.id)
    const result = await adminService.setAdminRole(profile.id, newRole, user.id)
    setActionId(null)

    if (!result.success) { setMsg('Failed: ' + result.error); return }

    setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p))
    setMsg(`Role updated for ${profile.email}`)
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-bold text-foreground">User Management</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-foreground">All Users</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} users</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search email or name…"
                className="h-9 pl-9 pr-4 w-full sm:w-64 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all" />
            </div>
          </div>

          {msg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-xs text-accent">{msg}</p>
            </div>
          )}

          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    {['User', 'Role', 'Joined', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map(p => {
                    const rc = ROLE_CFG[p.role as keyof typeof ROLE_CFG]
                    const isSelf = p.id === user?.id
                    const isSuperAdmin = p.role === 'super_admin'
                    const isAdmin = p.role === 'admin'
                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{p.full_name ?? p.email.split('@')[0]}</p>
                              <p className="text-xs text-muted-foreground">{p.email} {isSelf && <span className="text-accent">(you)</span>}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${rc?.bg} ${rc?.color}`}>
                            {rc?.label ?? p.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-muted-foreground">{formatDate(p.created_at)}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!isSelf && !isSuperAdmin && (
                            <button
                              onClick={() => toggleAdmin(p)}
                              disabled={actionId === p.id}
                              className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg transition-all disabled:opacity-50
                                ${isAdmin
                                  ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                }`}
                            >
                              {actionId === p.id
                                ? <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                : isAdmin ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />
                              }
                              {isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}