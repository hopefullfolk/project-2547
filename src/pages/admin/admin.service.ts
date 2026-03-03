import { supabase } from '../../lib/supabase'
import type { RequestSubmission } from '../request/request.types'

export interface AdminProfile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
}

export const adminService = {

  /** Get all requests ordered by newest first */
  async getAllRequests(): Promise<RequestSubmission[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data ?? []
  },

  /** Get single request */
  async getRequest(id: string): Promise<RequestSubmission | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()
    if (error) { console.error(error); return null }
    return data
  },

  /** Update request status + optional admin note */
  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'paid',
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('requests')
      .update({ status, admin_notes: adminNotes ?? null, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true }
  },

  /** Archive a request (move to archived_requests, delete from requests) */
  async archiveRequest(
    request: RequestSubmission,
    reason: 'paid' | 'rejected',
    adminId: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error: archiveError } = await supabase
      .from('archived_requests')
      .insert({
        original_id: request.id,
        user_id: request.user_id,
        archived_reason: reason,
        archived_by: adminId,
        full_name: request.full_name,
        email: request.email,
        phone: request.phone,
        school_name: request.school_name,
        program: request.program,
        study_semester: request.study_semester,
        amount: request.amount,
        currency: request.currency,
        school_account_name: request.school_account_name,
        school_account_number: request.school_account_number,
        school_bank_name: request.school_bank_name,
        school_sort_code: request.school_sort_code,
        admission_letter_url: request.admission_letter_url,
        fee_invoice_url: request.fee_invoice_url,
        additional_notes: request.additional_notes,
        admin_notes: request.admin_notes,
        final_status: request.status,
        original_created_at: request.created_at,
      })
    if (archiveError) return { success: false, error: archiveError.message }

    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', request.id)
    if (deleteError) return { success: false, error: deleteError.message }

    return { success: true }
  },

  /** Get all archived requests */
  async getArchivedRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('archived_requests')
      .select('*')
      .order('archived_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data ?? []
  },

  /** Get all user profiles (for admin management) */
  async getAllProfiles(): Promise<AdminProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data ?? []
  },

  /** Appoint or revoke admin role — only callable by admin/super_admin */
  async setAdminRole(
    targetUserId: string,
    newRole: 'user' | 'admin',
    appointedById: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)
    if (updateError) return { success: false, error: updateError.message }

    // Log the appointment
    const { error: logError } = await supabase
      .from('admin_appointments')
      .insert({
        target_user_id: targetUserId,
        appointed_by_id: appointedById,
        action: newRole === 'admin' ? 'granted' : 'revoked',
        new_role: newRole,
      })
    if (logError) console.error('Appointment log failed (non-critical):', logError)

    return { success: true }
  },

  /** Get status history for a request */
  async getStatusHistory(requestId: string) {
    const { data, error } = await supabase
      .from('request_status_history')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data ?? []
  },
}