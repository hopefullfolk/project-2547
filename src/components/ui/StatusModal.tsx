import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, CheckCircle, XCircle, DollarSign, FileText, ExternalLink, Upload, Trash2, ClipboardList, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const STATUS_CFG = {
  pending:          { label: 'Under Review',     Icon: Clock,         color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   step: 1 },
  approved:         { label: 'Approved',         Icon: CheckCircle,   color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    step: 2 },
  paid:             { label: 'Payment Sent',     Icon: DollarSign,    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', step: 3 },
  rejected:         { label: 'Not Approved',     Icon: XCircle,       color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    step: 0 },
  awaiting_results: { label: 'Results Required', Icon: ClipboardList, color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200',  step: 1 },
}

const PROGRESS_STEPS = ['Submitted', 'Under Review', 'Approved', 'Payment Sent']

function fmt(str: string) {
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtFull(str: string) {
  return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmitNew?: () => void
}

export default function StatusModal({ isOpen, onClose, onSubmitNew }: Props) {
  const { user } = useAuth()

  const [request, setRequest] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<'status' | 'docs'>('status')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploadType, setUploadType] = useState('results')

  const load = async () => {
    if (!user) return
    setIsLoading(true)

    // Step 1: get the user's latest request
    const { data: req } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setRequest(req)

    // Step 2: only fetch related data if we have a request
    if (req) {
      const [{ data: hist }, { data: docs }] = await Promise.all([
        supabase.from('request_status_history')
          .select('*')
          .eq('request_id', req.id)
          .order('created_at', { ascending: true }),
        supabase.from('request_documents')
          .select('*')
          .eq('request_id', req.id)
          .order('uploaded_at', { ascending: false }),
      ])
      setHistory(hist ?? [])
      setDocuments(docs ?? [])
    } else {
      setHistory([])
      setDocuments([])
    }

    setIsLoading(false)
  }

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => { if (isOpen) load() }, [isOpen, user])

  const handleUpload = async (file: File) => {
    if (!request || !user) return
    setIsUploading(true)
    setUploadStatus('idle')
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${request.id}/${uploadType}-${Date.now()}.${ext}`
    const { error: storageError } = await supabase.storage.from('user-uploads').upload(fileName, file)
    if (storageError) {
      console.error('Upload error:', storageError)
      setUploadStatus('error')
      setIsUploading(false)
      return
    }
    const { data } = supabase.storage.from('user-uploads').getPublicUrl(fileName)
    const { error: dbError } = await supabase.from('request_documents').insert({
      request_id: request.id,
      user_id: user.id,
      document_type: uploadType,
      label: uploadLabel || file.name,
      file_url: data.publicUrl,
    })
    if (dbError) {
      console.error('DB insert error:', dbError)
      setUploadStatus('error')
    } else {
      setUploadStatus('success')
      setUploadLabel('')
      await load()
    }
    setIsUploading(false)
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    const path = fileUrl.split('/user-uploads/')[1]
    if (path) await supabase.storage.from('user-uploads').remove([path])
    await supabase.from('request_documents').delete().eq('id', docId)
    await load()
  }

  const sc = request ? STATUS_CFG[request.status as keyof typeof STATUS_CFG] : null
  const currentStep = sc?.step ?? 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative z-10 flex items-end sm:items-center justify-center min-h-full sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full sm:max-w-lg"
            >
              <div className="hidden sm:flex justify-end mb-3">
                <button onClick={onClose}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[100dvh] sm:max-h-[82vh] overflow-y-auto scrollbar-hide bg-white sm:rounded-2xl rounded-t-2xl relative">
                {/* Mobile close */}
                <button onClick={onClose}
                  className="sm:hidden absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>

                {isLoading ? (
                  <div className="p-16 text-center">
                    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
                  </div>
                ) : !request ? (
                  <div className="p-12 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-base font-semibold text-foreground mb-1">No request found</p>
                    <p className="text-sm text-muted-foreground mb-6">You haven't submitted a scholarship request yet.</p>
                    {onSubmitNew && (
                      <button onClick={() => { onClose(); setTimeout(onSubmitNew, 300) }}
                        className="h-11 px-6 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-xl transition-colors">
                        Submit a Request
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Status card */}
                    <div className="p-6 border-b border-border/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">{request.school_name}</p>
                          <p className="text-sm font-bold text-foreground">{request.program}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Submitted {fmt(request.created_at)}</p>
                        </div>
                        {sc && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${sc.bg} ${sc.color} ${sc.border}`}>
                            <sc.Icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 bg-muted/30 rounded-xl mb-4">
                        <p className="text-xs text-muted-foreground mb-0.5">Requested amount</p>
                        <p className="text-lg font-bold text-foreground">
                          {request.currency} {Number(request.amount).toLocaleString()}
                        </p>
                      </div>

                      {/* Progress */}
                      {request.status !== 'rejected' && (
                        <div className="flex items-center">
                          {PROGRESS_STEPS.map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                                ${i < currentStep ? 'bg-accent text-white' :
                                  i === currentStep ? 'bg-accent text-white ring-4 ring-accent/20' :
                                  'bg-muted text-muted-foreground'}`}>
                                {i < currentStep ? '✓' : i + 1}
                              </div>
                              {i < PROGRESS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-accent' : 'bg-muted'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border/20 px-6">
                      {(['status', 'docs'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                          className={`py-3 px-1 mr-5 text-sm font-semibold border-b-2 transition-colors
                            ${tab === t ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                          {t === 'status' ? 'Status' : 'Documents'}
                        </button>
                      ))}
                    </div>

                    {tab === 'status' && (
                      <div className="p-6 space-y-4">
                        {/* Action required banner for awaiting_results */}
                        {request.status === 'awaiting_results' && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-purple-800 mb-1">Action Required — Upload Your Results</p>
                                <p className="text-xs text-purple-700 leading-relaxed mb-3">
                                  Hope Catalyst needs your academic results before your request can be approved. Please upload them in the Documents tab.
                                </p>
                                <button
                                  onClick={() => setTab('docs')}
                                  className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                >
                                  Upload Results →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {request.admin_notes && (
                          <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1.5">Note from Hope Catalyst</p>
                            <p className="text-sm text-foreground leading-relaxed">{request.admin_notes}</p>
                          </div>
                        )}

                        {(request.admission_letter_url || request.fee_invoice_url) && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Submitted Documents</p>
                            {request.admission_letter_url && (
                              <a href={request.admission_letter_url} target="_blank" rel="noreferrer"
                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/5 border border-accent/15 hover:bg-accent/10 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-4 h-4 text-accent" />
                                  <span className="text-sm font-medium">Admission Letter</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-accent/50" />
                              </a>
                            )}
                            {request.fee_invoice_url && (
                              <a href={request.fee_invoice_url} target="_blank" rel="noreferrer"
                                className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent/5 border border-accent/15 hover:bg-accent/10 transition-colors">
                                <div className="flex items-center gap-2.5">
                                  <FileText className="w-4 h-4 text-accent" />
                                  <span className="text-sm font-medium">Fee Invoice</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-accent/50" />
                              </a>
                            )}
                          </div>
                        )}

                        {history.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Timeline</p>
                            {history.map((h: any) => (
                              <div key={h.id} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-foreground capitalize">{h.new_status}</p>
                                  {h.note && <p className="text-xs text-muted-foreground mt-0.5">"{h.note}"</p>}
                                  <p className="text-xs text-muted-foreground/60">{fmtFull(h.created_at)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {tab === 'docs' && (
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upload Additional Document</p>
                          <div className="grid grid-cols-2 gap-2">
                            <select value={uploadType} onChange={e => setUploadType(e.target.value)}
                              className="h-9 px-3 rounded-lg border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all">
                              <option value="results">Results</option>
                              <option value="id">ID Document</option>
                              <option value="proof_of_payment">Proof of Payment</option>
                              <option value="other">Other</option>
                            </select>
                            <input type="text" value={uploadLabel} onChange={e => setUploadLabel(e.target.value)}
                              placeholder="Label (optional)"
                              className="h-9 px-3 rounded-lg border border-border/60 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                          </div>
                          <label className={`flex items-center justify-center w-full h-10 border-2 border-dashed border-border/60 rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all text-sm font-medium text-muted-foreground ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading
                              ? <><div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin mr-2" />Uploading...</>
                              : <><Upload className="w-4 h-4 mr-2" />Choose file</>}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={isUploading}
                              onChange={e => { if (e.target.files?.[0]) { setUploadStatus('idle'); handleUpload(e.target.files[0]) } }} />
                          </label>
                          {uploadStatus === 'success' && (
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> Document uploaded successfully
                            </p>
                          )}
                          {uploadStatus === 'error' && (
                            <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Upload failed — please try again
                            </p>
                          )}
                        </div>

                        {documents.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Uploaded</p>
                            {documents.map((doc: any) => (
                              <div key={doc.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/30">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{doc.label}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{doc.document_type.replace('_', ' ')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                                  <a href={doc.file_url} target="_blank" rel="noreferrer"
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button onClick={() => handleDelete(doc.id, doc.file_url)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No additional documents uploaded yet</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}