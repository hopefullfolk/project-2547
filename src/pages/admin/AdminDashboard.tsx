import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Clock, CheckCircle, XCircle, DollarSign,
  LogOut, Archive, Users, RefreshCw, ArrowUpRight, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../features/admin/admin.service'
import type { RequestSubmission } from '../../features/request/request.types'
import { formatCurrency, formatDate } from '../../lib/utils'

const STATUS_CFG = {
  pending:  { label: 'Pending',  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  approved: { label: 'Approved', color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200'  },
  rejected: { label: 'Rejected', color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200'  },
  paid:     { label: 'Paid',     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200'},
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'paid'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [requests, setRequests] = useState<RequestSubmission[]>([])
  const [filtered, setFiltered] = useState<RequestSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    const data = await adminService.getAllRequests()
    setRequests(data)
    if (!silent) setIsLoading(false)
    else setIsRefreshing(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = requests
    if (filter !== 'all') result = result.filter(r => r.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.school_name.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [requests, filter, search])

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    paid:     requests.filter(r => r.status === 'paid').length,
  }

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-serif font-bold text-primary">Hope Catalyst</span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/users')}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors">
              <Users className="w-3.5 h-3.5" /> Users
            </button>
            <button onClick={() => navigate('/admin/archived')}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors">
              <Archive className="w-3.5 h-3.5" /> Archived
            </button>
            <button onClick={() => load(true)} disabled={isRefreshing}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-rose-50 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'text-accent', bg: 'bg-accent/10', key: 'all' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', key: 'pending' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', key: 'approved' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', key: 'rejected' },
            { label: 'Paid', value: stats.paid, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', key: 'paid' },
          ].map((s, i) => (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setFilter(s.key as FilterStatus)}
              className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                filter === s.key ? 'border-accent shadow-sm ring-2 ring-accent/20' : 'border-border/50 shadow-sm'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} strokeWidth={2} />
              </div>
              <p className="text-2xl font-bold text-foreground">{isLoading ? '—' : s.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{s.label}</p>
            </motion.button>
          ))}
        </div>

        {/* ── Requests table ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
          {/* Table header */}
          <div className="px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h2 className="font-bold text-foreground">
                {filter === 'all' ? 'All Requests' : `${STATUS_CFG[filter as keyof typeof STATUS_CFG]?.label} Requests`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, email, school…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-9 pr-4 w-full sm:w-64 rounded-xl border border-border/60 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    {['Student', 'School', 'Amount', 'Status', 'Submitted', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map(req => {
                    const s = STATUS_CFG[req.status as keyof typeof STATUS_CFG]
                    return (
                      <tr key={req.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-foreground">{req.full_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{req.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-foreground">{req.school_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{req.program}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-foreground">{formatCurrency(Number(req.amount), req.currency)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${s?.bg} ${s?.color} ${s?.border}`}>
                            {s?.label ?? req.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(req.created_at)}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/requests/${req.id}`)}
                            className="inline-flex items-center gap-1 h-8 px-3 text-xs font-semibold text-accent hover:text-white bg-accent/10 hover:bg-accent rounded-lg transition-all"
                          >
                            Review <ArrowUpRight className="w-3 h-3" />
                          </button>
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