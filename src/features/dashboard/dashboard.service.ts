import { supabase } from '../../lib/supabase'
import type { RequestSubmission } from '../request/request.types'

export interface StatusHistoryEntry {
  id: string
  request_id: string
  old_status: string | null
  new_status: string
  note: string | null
  created_at: string
}

export interface RequestDocument {
  id: string
  request_id: string
  document_type: 'results' | 'id_document' | 'proof_of_payment' | 'other'
  label: string | null
  file_url: string
  uploaded_at: string
}

export const dashboardService = {

  /** Get the current user's active request (pending or approved) */
  async getActiveRequest(userId: string): Promise<RequestSubmission | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) { console.error('getActiveRequest:', error); return null }
    return data
  },

  /** Get ALL requests for a user (active + archived) */
  async getAllRequests(userId: string): Promise<RequestSubmission[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) { console.error('getAllRequests:', error); return [] }
    return data ?? []
  },

  /** Get status history for a request */
  async getStatusHistory(requestId: string): Promise<StatusHistoryEntry[]> {
    const { data, error } = await supabase
      .from('request_status_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) { console.error('getStatusHistory:', error); return [] }
    return data ?? []
  },

  /** Get documents uploaded for a request */
  async getDocuments(requestId: string): Promise<RequestDocument[]> {
    const { data, error } = await supabase
      .from('request_documents')
      .select('*')
      .eq('request_id', requestId)
      .order('uploaded_at', { ascending: false })

    if (error) { console.error('getDocuments:', error); return [] }
    return data ?? []
  },

  /** Upload a document for a request */
  async uploadDocument(
    file: File,
    requestId: string,
    userId: string,
    documentType: RequestDocument['document_type'],
    label: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Upload to storage under user's folder
      const ext = file.name.split('.').pop()
      const fileName = `${userId}/${requestId}/${documentType}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file, { upsert: false })

      if (uploadError) return { success: false, error: uploadError.message }

      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName)

      // Insert record
      const { error: insertError } = await supabase
        .from('request_documents')
        .insert({
          request_id: requestId,
          user_id: userId,
          document_type: documentType,
          label,
          file_url: urlData.publicUrl,
        })

      if (insertError) return { success: false, error: insertError.message }
      return { success: true }
    } catch {
      return { success: false, error: 'Upload failed' }
    }
  },

  /** Delete a document */
  async deleteDocument(docId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('request_documents')
      .delete()
      .eq('id', docId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  },

  /** Get user profile */
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) { console.error('getProfile:', error); return null }
    return data
  },

  /** Update profile */
  async updateProfile(
    userId: string,
    updates: { full_name?: string; phone?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  },
}