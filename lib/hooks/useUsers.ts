import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types/product'

import { createAuditLog } from './useAuditLogs'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, isLoading, error, refetch: fetchUsers }
}

export async function updateUserRole(userId: string, role: 'admin' | 'readonly' | 'pending') {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  if (currentUser) {
    await createAuditLog({
      user_id: currentUser.id,
      action: 'update',
      table_name: 'profiles',
      record_id: userId,
      changes: { role, email: data.email }
    })
  }

  return data
}
export async function deleteUser(userId: string) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get user info before deleting for audit log
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error

  if (currentUser) {
    await createAuditLog({
      user_id: currentUser.id,
      action: 'delete',
      table_name: 'profiles',
      record_id: userId,
      changes: { email: profile?.email || 'unknown' }
    })
  }

  return true
}
