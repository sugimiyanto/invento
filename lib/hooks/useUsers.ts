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
