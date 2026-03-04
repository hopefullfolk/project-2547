import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, CheckCircle, XCircle, DollarSign, Archive,
  ExternalLink, Clock, User, School, CreditCard, MessageSquare, ChevronDown, ClipboardList
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../features/admin/admin.service'
import { emailService } from '../../lib/email'
import type { RequestSubmission } from '../../features/request/request.types'
import { formatCurrency, formatDatetime } from '../../lib/utils'

const STATUS_CFG = {
  pending:          { label: 'Pending',          Icon: Clock,          color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  approved:         { label: 'Approved',         Icon: CheckCircle,    color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200'  },
  rejected:         { label: 'Rejected',         Icon: XCircle,        color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200'  },
  paid:             { label: 'Paid',             Icon: DollarSign,     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200'},
  awaiting_results: { label: 'Awaiting Results', Icon: ClipboardList,  color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200'},
}

function Section({ icon: Icon, title, children }: {
  icon: React.ComponentType<any>; title: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/30 bg-muted/20">
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/20 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

function DocLink({ label, url }: { label: string; url?: string | null }) {
  if (!url) return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-muted/30 border border-border/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/60">Not uploaded</span>
    </div>
  )
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors group">
      <div className="flex items-center gap-3">
        <FileText className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-accent/50 group-hover:text-accent transition-colors" />
    </a>
  )
}

type NewStatus = 'approved' | 'rejected' | 'paid' | 'awaiting_results'
const ACTION_BTNS: { status: NewStatus; label: string; Icon: any; color: string }[] = [
  { status: 'approved',         label: 'Approve',         Icon: CheckCircle,   color: 'bg-blue-500 hover:bg-blue-600 text-white' },
  { status: 'awaiting_results', label: 'Request Results', Icon: ClipboardList, color: 'bg-purple-500 hover:bg-purple-600 text-white' },
  { status: 'rejected',         label: 'Reject',          Icon: XCircle,       color: 'bg-rose-500 hover:bg-rose-600 text-white' },
  { status: 'paid',             label: 'Mark Paid',       Icon: DollarSign,    color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
]

export default function RequestReview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [request, setRequest] = useState<RequestSubmission | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')
  const [showArchive, setShowArchive] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      adminService.getRequest(id),
      adminService.getStatusHistory(id),
      adminService.getRequestDocs(id),
    ]).then(([req, hist, docs]) => {
      if (req) { setRequest(req); setAdminNotes(req.admin_notes ?? '') }
      setHistory(hist)
      setUploadedDocs(docs)
      setIsLoading(false)
    })
  }, [id])

  const updateStatus = async (status: NewStatus) => {
    if (!request || !id) return
    const confirm = window.confirm(
      `Set status to "${status}"${adminNotes ? ' with your note' : ''}?`
    )
    if (!confirm) return
    setIsUpdating(true)
    setUpdateMsg('')

    const result = await adminService.updateStatus(id, status, adminNotes)
    if (!result.success) { setUpdateMsg('Update failed: ' + result.error); setIsUpdating(false); return }

    // Reload
    const [updated, hist, docs] = await Promise.all([
      adminService.getRequest(id),
      adminService.getStatusHistory(id),
      adminService.getRequestDocs(id),
    ])
    if (updated) setRequest(updated)
    setHistory(hist)
    setUploadedDocs(docs)
    setUpdateMsg(`Status updated to ${status}`)

    // Notify applicant (non-blocking)
    emailService.sendStatusUpdateEmail(updated!).catch(console.error)

    setIsUpdating(false)
  }

  const handleArchive = async () => {
    if (!request || !user) return
    const reason = request.status as 'paid' | 'rejected'
    const result = await adminService.archiveRequest(request, reason, user.id)
    if (!result.success) { setUpdateMsg('Archive failed: ' + result.error); return }
    navigate('/admin/dashboard')
  }

  const handleDelete = async () => {
    if (!request) return
    const confirmed = window.confirm(`Permanently delete this request from ${request.full_name}? This cannot be undone.`)
    if (!confirmed) return
    const result = await adminService.deleteRequest(request.id)
    if (!result.success) { setUpdateMsg('Delete failed: ' + result.error); return }
    navigate('/admin/dashboard')
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )

  if (!request) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="text-lg font-semibold text-primary">Request not found</p>
        <button onClick={() => navigate('/admin/dashboard')} className="text-sm text-accent hover:underline">
          Back to dashboard
        </button>
      </div>
    </div>
  )

  const sc = STATUS_CFG[request.status as keyof typeof STATUS_CFG]

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 text-muted-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{request.full_name}</p>
              <p className="text-xs text-muted-foreground">{request.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${sc?.bg} ${sc?.color} ${sc?.border}`}>
            {sc?.Icon && <sc.Icon className="w-3 h-3" />}
            {sc?.label ?? request.status}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Section icon={User} title="Personal Information">
                <Row label="Full Name" value={request.full_name} />
                <Row label="Email" value={request.email} />
                <Row label="Phone" value={request.phone} />
                <Row label="Submitted" value={formatDatetime(request.created_at)} />
              </Section>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Section icon={School} title="School Information">
                <Row label="School" value={request.school_name} />
                <Row label="Program" value={request.program} />
                <Row label="Semester" value={request.study_semester} />
              </Section>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Section icon={CreditCard} title="Payment Details">
                <Row label="Amount" value={formatCurrency(Number(request.amount), request.currency)} />
                <Row label="Account Name" value={request.school_account_name} />
                <Row label="Account Number" value={request.school_account_number} mono />
                <Row label="Bank" value={request.school_bank_name} />
                {request.school_sort_code && <Row label="Sort Code" value={request.school_sort_code} mono />}
              </Section>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Section icon={FileText} title="Documents">
                <div className="space-y-3">
                  <DocLink label="Admission Letter" url={request.admission_letter_url} />
                  <DocLink label="Fee Invoice" url={request.fee_invoice_url} />
                </div>

                {uploadedDocs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Student Uploaded Documents
                    </p>
                    <div className="space-y-2">
                      {uploadedDocs.map((doc: any) => (
                        <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer"
                          className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors group">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{doc.label || doc.document_type}</p>
                              <p className="text-xs text-muted-foreground capitalize">{doc.document_type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {request.additional_notes && (
                  <div className="mt-4 p-4 bg-muted/40 rounded-xl">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Applicant Note</p>
                    <p className="text-sm text-foreground leading-relaxed">{request.additional_notes}</p>
                  </div>
                )}
              </Section>
            </motion.div>

            {/* Status history */}
            {history.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Section icon={Clock} title="Status History">
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">{h.new_status}</p>
                          {h.note && <p className="text-xs text-muted-foreground mt-0.5">"{h.note}"</p>}
                          <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDatetime(h.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </motion.div>
            )}
          </div>

          {/* ── Right column: actions ── */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    Admin Note
                  </h3>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add a note for the applicant (optional)…"
                    className="w-full px-4 py-3 rounded-xl border border-border/60 bg-white text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  {ACTION_BTNS.filter(b => b.status !== request.status).map(btn => (
                    <button
                      key={btn.status}
                      onClick={() => updateStatus(btn.status)}
                      disabled={isUpdating}
                      className={`w-full h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${btn.color}`}
                    >
                      {isUpdating
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <btn.Icon className="w-4 h-4" />
                      }
                      {btn.label}
                    </button>
                  ))}
                </div>

                {updateMsg && (
                  <p className={`text-xs text-center ${updateMsg.startsWith('Update failed') ? 'text-destructive' : 'text-emerald-600'}`}>
                    {updateMsg}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Archive */}
            {(request.status === 'paid' || request.status === 'rejected') && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
                  <button
                    onClick={() => setShowArchive(!showArchive)}
                    className="flex items-center justify-between w-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2"><Archive className="w-4 h-4" />Archive</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showArchive ? 'rotate-180' : ''}`} />
                  </button>
                  {showArchive && (
                    <div className="mt-4 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Move this request to the archive. It will no longer appear in the main dashboard.
                      </p>
                      <button
                        onClick={handleArchive}
                        className="w-full h-10 rounded-xl text-sm font-semibold bg-muted/50 hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-2"
                      >
                        <Archive className="w-4 h-4" /> Confirm Archive
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Permanent delete */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Danger Zone</p>
                <p className="text-xs text-muted-foreground mb-4">Permanently delete this request and all associated data. Cannot be undone.</p>
                <button
                  onClick={handleDelete}
                  className="w-full h-10 rounded-xl text-sm font-semibold bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 hover:border-rose-500 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Delete Request
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}