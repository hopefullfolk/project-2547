export interface RequestFormData {
  // Step 1: Personal Information
  fullName: string
  email: string
  phone: string
  
  // Step 2: School Information
  schoolName: string
  program: string
  studySemester: string  // Changed from yearOfStudy
  
  // Step 3: Payment Details
  amount: string
  currency: 'NGN' | 'USD'
  schoolAccountName: string
  schoolAccountNumber: string  // NEW - separate field
  schoolSortCode?: string  // Changed from schoolAccountDetails, now optional
  schoolBankName: string
  
  // Step 4: Documents
  admissionLetter?: File | null
  feeInvoice?: File | null
  
  // Additional
  additionalNotes?: string

  // Auth
  userId?: string | null
}

export interface RequestSubmission {
  id: string
  created_at: string
  updated_at: string
  
  // Personal Information
  full_name: string
  email: string
  phone: string
  
  // School Information
  school_name: string
  program: string
  study_semester: string  // Changed from year_of_study
  
  // Payment Details
  amount: string
  currency: 'NGN' | 'USD'
  school_account_name: string
  school_account_number: string  // NEW
  school_sort_code: string | null  // Changed from school_account_details
  school_bank_name: string
  
  // Document URLs
  admission_letter_url: string | null
  fee_invoice_url: string | null
  
  // Additional
  additional_notes: string | null
  
  // Status tracking
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'awaiting_results'
  admin_notes: string | null
  user_id: string | null
}