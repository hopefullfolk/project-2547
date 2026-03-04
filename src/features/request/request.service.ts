import { supabase } from '../../lib/supabase'
import type { RequestFormData, RequestSubmission } from './request.types'
import { emailService } from '../../lib/email'  // ✅ EDIT #1: Added email service import

export const requestService = {
  /**
   * Check if email already has an active request
   */
  async checkDuplicate(email: string): Promise<{ isDuplicate: boolean; existingRequest?: RequestSubmission }> {
    try {
      console.log('🔍 Checking for duplicate request:', email)

      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('email', email.toLowerCase())
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ Error checking duplicate:', error)
        return { isDuplicate: false }
      }

      if (data && data.length > 0) {
        console.log('⚠️ Duplicate found:', data[0])
        return { isDuplicate: true, existingRequest: data[0] }
      }

      console.log('✅ No duplicate found')
      return { isDuplicate: false }
    } catch (error) {
      console.error('❌ Unexpected error checking duplicate:', error)
      return { isDuplicate: false }
    }
  },

  /**
   * Submit a new request with file uploads
   */
  async submitRequest(data: RequestFormData): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      console.log('🚀 SERVICE: Starting submission with data:', data)

      // Check for duplicate FIRST
      const duplicateCheck = await this.checkDuplicate(data.email)
      
      if (duplicateCheck.isDuplicate) {
        console.error('❌ Duplicate submission detected')
        const existing = duplicateCheck.existingRequest!
        return { 
          success: false, 
          error: `You already have a ${existing.status} request submitted on ${new Date(existing.created_at).toLocaleDateString()}. Please check your email for updates or contact support.`
        }
      }

      // 1. Upload admission letter if provided
      let admissionLetterUrl: string | undefined
      if (data.admissionLetter) {
        console.log('📄 SERVICE: Uploading admission letter...')
        
        const admissionResult = await this.uploadDocument(
          data.admissionLetter,
          'admission-letter'
        )
        
        if (!admissionResult.success) {
          console.error('❌ SERVICE: Failed to upload admission letter:', admissionResult.error)
          return { 
            success: false, 
            error: `Failed to upload admission letter: ${admissionResult.error}` 
          }
        }
        admissionLetterUrl = admissionResult.url
        console.log('✅ SERVICE: Admission letter uploaded:', admissionLetterUrl)
      }

      // 2. Upload fee invoice if provided
      let feeInvoiceUrl: string | undefined
      if (data.feeInvoice) {
        console.log('📄 SERVICE: Uploading fee invoice...')
        
        const invoiceResult = await this.uploadDocument(
          data.feeInvoice,
          'fee-invoice'
        )
        
        if (!invoiceResult.success) {
          console.error('❌ SERVICE: Failed to upload fee invoice:', invoiceResult.error)
          return { 
            success: false, 
            error: `Failed to upload fee invoice: ${invoiceResult.error}` 
          }
        }
        feeInvoiceUrl = invoiceResult.url
        console.log('✅ SERVICE: Fee invoice uploaded:', feeInvoiceUrl)
      }

      // 3. Prepare database payload
      const dbPayload = {
        full_name: data.fullName,
        email: data.email.toLowerCase(), // Store lowercase for consistency
        phone: data.phone,
        school_name: data.schoolName,
        program: data.program,
        study_semester: data.studySemester,
        amount: data.amount,
        currency: data.currency,
        school_account_name: data.schoolAccountName,
        school_account_number: data.schoolAccountNumber,
        school_sort_code: data.schoolSortCode || null,
        school_bank_name: data.schoolBankName,
        admission_letter_url: admissionLetterUrl || null,
        fee_invoice_url: feeInvoiceUrl || null,
        additional_notes: data.additionalNotes || null,
        status: 'pending',
        user_id: data.userId ?? null
      }

      console.log('💾 SERVICE: Inserting into Supabase...')
      const { data: requestData, error } = await supabase
        .from('requests')
        .insert(dbPayload)
        .select()
        .single()

      if (error) {
        console.error('❌ SERVICE: Database insert error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ SERVICE: Successfully inserted into database!')
      console.log('✅ SERVICE: Request ID:', requestData.id)

      // ✅ EDIT #2: Send confirmation email (non-blocking)
      emailService.sendConfirmationEmail(requestData)
        .catch(err => console.error('Email send failed (non-critical):', err))

      // ✅ EDIT #2: Send admin alert (non-blocking)  
      emailService.sendAdminAlert(requestData, 'segohopo@gmail.com')
        .catch(err => console.error('Admin alert failed (non-critical):', err))
      
      return { success: true, id: requestData.id }
    } catch (error) {
      console.error('❌ SERVICE: Unexpected error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  /**
   * Upload a document to Supabase Storage
   */
  async uploadDocument(
    file: File,
    prefix: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log(`📤 UPLOAD: Starting upload for ${prefix}`)

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        console.error(`❌ UPLOAD: File too large`)
        return { success: false, error: 'File size exceeds 5MB limit' }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const fileName = `${prefix}-${timestamp}-${random}.${fileExt}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('request-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ UPLOAD: Upload error:', uploadError)
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const { data } = supabase.storage
        .from('request-documents')
        .getPublicUrl(fileName)

      console.log(`✅ UPLOAD: File uploaded successfully`)
      return { success: true, url: data.publicUrl }
    } catch (error) {
      console.error('❌ UPLOAD: Unexpected error:', error)
      return { success: false, error: 'Failed to upload file' }
    }
  },

  /**
   * Delete files from storage
   */
  async deleteFiles(admissionLetterUrl?: string | null, feeInvoiceUrl?: string | null): Promise<void> {
    try {
      const filesToDelete: string[] = []

      // Extract file paths from URLs
      if (admissionLetterUrl) {
        const path = admissionLetterUrl.split('/request-documents/')[1]
        if (path) filesToDelete.push(path)
      }
      if (feeInvoiceUrl) {
        const path = feeInvoiceUrl.split('/request-documents/')[1]
        if (path) filesToDelete.push(path)
      }

      if (filesToDelete.length > 0) {
        console.log('🗑️ Deleting files from storage:', filesToDelete)
        const { error } = await supabase.storage
          .from('request-documents')
          .remove(filesToDelete)

        if (error) {
          console.error('⚠️ Error deleting files (non-critical):', error)
        } else {
          console.log('✅ Files deleted from storage')
        }
      }
    } catch (error) {
      console.error('⚠️ Error deleting files (non-critical):', error)
    }
  },

  /**
   * Get all requests
   */
  async getAllRequests(): Promise<RequestSubmission[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching requests:', error)
      return []
    }

    return data || []
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(id: string): Promise<RequestSubmission | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching request:', error)
      return null
    }

    return data
  },

  /**
   * Get request by email and ID (for status checker)
   */
  async getRequestByEmailAndId(email: string, requestId: string): Promise<RequestSubmission | null> {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('id', requestId)
      .single()

    if (error) {
      console.error('Error fetching request:', error)
      return null
    }

    return data
  },

  /**
   * Update request status
   */
  async updateRequestStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'paid',
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📝 Updating request ${id} to status: ${status}`)
      
      const { data, error } = await supabase
        .from('requests')
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('❌ Error updating status:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Status updated successfully')

      // ✅ EDIT #3: Send status update email (non-blocking)
      if (status !== 'pending') {
        emailService.sendStatusUpdateEmail(data[0])
          .catch(err => console.error('Status email failed (non-critical):', err))
      }

      return { success: true }
    } catch (error) {
      console.error('❌ Unexpected error updating status:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  /**
   * Archive request to archived_requests table
   */
  async archiveRequest(
    request: RequestSubmission,
    reason: 'rejected' | 'paid'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📦 Archiving ${reason} request ${request.id} to Supabase`)

      // Get current admin user email
      const { data: { user } } = await supabase.auth.getUser()
      const adminEmail = user?.email || 'unknown'

      // Insert into archived_requests table
      const { error: archiveError } = await supabase
        .from('archived_requests')
        .insert({
          original_id: request.id,
          created_at: request.created_at,
          archived_reason: reason,
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
          school_sort_code: request.school_sort_code,
          school_bank_name: request.school_bank_name,
          admission_letter_url: request.admission_letter_url,
          fee_invoice_url: request.fee_invoice_url,
          additional_notes: request.additional_notes,
          admin_notes: request.admin_notes,
          final_status: request.status,
          archived_by_email: adminEmail
        })

      if (archiveError) {
        console.error('❌ Error archiving request:', archiveError)
        return { success: false, error: archiveError.message }
      }

      console.log('✅ Request archived to Supabase')

      // Delete associated files from storage
      await this.deleteFiles(request.admission_letter_url, request.fee_invoice_url)

      // Delete from main requests table
      const { error: deleteError } = await supabase
        .from('requests')
        .delete()
        .eq('id', request.id)

      if (deleteError) {
        console.error('❌ Error deleting request:', deleteError)
        return { 
          success: false, 
          error: `Archived but failed to delete: ${deleteError.message}` 
        }
      }

      console.log('✅ Request deleted from main table')
      return { success: true }
    } catch (error) {
      console.error('❌ Unexpected error archiving:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  /**
   * Get all archived requests
   */
  async getArchivedRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('archived_requests')
      .select('*')
      .order('archived_at', { ascending: false })

    if (error) {
      console.error('Error fetching archived requests:', error)
      return []
    }

    return data || []
  }
}