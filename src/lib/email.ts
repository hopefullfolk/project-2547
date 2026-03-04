import { supabase } from './supabase'
import type { RequestSubmission } from '../features/request/request.types'

export const emailService = {
  async sendConfirmationEmail(request: RequestSubmission): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { type: 'confirmation', to: request.email, requestData: request }
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to send email' }
    }
  },

  async sendStatusUpdateEmail(request: RequestSubmission): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { type: 'status_update', to: request.email, requestData: request }
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to send email' }
    }
  },

  async sendAdminAlert(request: RequestSubmission, adminEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { type: 'admin_alert', to: adminEmail, requestData: request }
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch {
      return { success: false, error: 'Failed to send email' }
    }
  }
}