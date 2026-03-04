import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Archive, Trash2, RefreshCw, Search } from 'lucide-react'
import { adminService } from '../../features/admin/admin.service'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function ArchivedRequests() {
  const navigate = useNavigate()
  const [archives, setArchives] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)
    const data = await adminService.getArchivedRequests()
    setArchives(data)
    if (!silent) setIsLoading(false)
    else setIsRefreshing(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(archives); return }
    const q = search.toLowerCase()
    setFiltered(archives.filter(a =>
      a.full_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.school_name?.toLowerCase().includes(q)
    ))
  }, [archives, search])

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Permanently delete archived request from ${name}? This cannot be undone.`)
    if (!confirmed) return
    setDeletingId(id)
    const result = await adminService.deleteArchivedRequest(id)
    if (result.success) {
      setArchives(prev => prev.filter(a => a.id !== id))
    } else {
      alert('Delete failed: ' + result.error)
    }
    setDeletingId(null)
  }

  const REASON_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    rejected: { label: 'Rejected', color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200' },
    paid:     { label: 'Paid',     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 text-muted-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span className="font-bold text-foreground">Archived Requests</span>
              {!isLoading && (
                <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  {archives.length}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => load(true)} disabled={isRefreshing}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
          {/* Search bar */}
          <div className="px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{filtered.length} archived record{filtered.length !== 1 ? 's' : ''}</p>
            </div>
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
              <p className="text-sm text-muted-foreground">Loading archives...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Archive className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No archived requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    {['Student', 'School', 'Amount', 'Reason', 'Archived', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map(archive => {
                    const r = REASON_CFG[archive.archived_reason] ?? REASON_CFG['rejected']
                    const isDeleting = deletingId === archive.id
                    return (
                      <tr key={archive.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-foreground">{archive.full_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{archive.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-foreground">{archive.school_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{archive.program}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-foreground">
                            {formatCurrency(Number(archive.amount), archive.currency)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${r.bg} ${r.color} ${r.border}`}>
                            {r.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-muted-foreground whitespace-nowrap">
                            {archive.archived_at ? formatDate(archive.archived_at) : formatDate(archive.created_at)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDelete(archive.id, archive.full_name)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-lg transition-all disabled:opacity-50"
                          >
                            {isDeleting
                              ? <div className="w-3 h-3 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
                              : <Trash2 className="w-3 h-3" />
                            }
                            Delete
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