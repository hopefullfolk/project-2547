import { supabase } from '../../lib/supabase'

export type UserRole = 'user' | 'admin' | 'super_admin'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name?: string
}

async function getProfileRole(userId: string): Promise<{ role: UserRole; full_name: string }> {
  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()
  return {
    role: (data?.role as UserRole) ?? 'user',
    full_name: data?.full_name ?? '',
  }
}

export async function signUp(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { success: false, error: error.message }
    if (data.user && !data.session) return { success: true, needsVerification: true }
    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    if (!data.user) return { success: false, error: 'No user returned' }

    const { role, full_name } = await getProfileRole(data.user.id)
    return {
      success: true,
      user: { id: data.user.id, email: data.user.email ?? '', role, full_name },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<{ user: AuthUser | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { user: null }

    const { role, full_name } = await getProfileRole(session.user.id)
    return {
      user: { id: session.user.id, email: session.user.email ?? '', role, full_name },
    }
  } catch {
    return { user: null }
  }
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null)
      return
    }
    const { role, full_name } = await getProfileRole(session.user.id)
    callback({ id: session.user.id, email: session.user.email ?? '', role, full_name })
  })
}

export function getRedirectPath(role: UserRole): string {
  return role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
}

export async function resetPassword(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Named export object — used by AuthModal and AuthContext
export const authService = {
  signUp,
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
  getRedirectPath,
  resetPassword,
}