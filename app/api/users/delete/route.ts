import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    console.log('[Delete API] Current user:', currentUser?.id, currentUser?.email)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    console.log('[Delete API] Current user profile:', currentUserProfile, 'Error:', profileError)

    if (currentUserProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { userId } = await request.json()
    console.log('[Delete API] Deleting user:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get the Supabase admin client with service role key
    const supabaseAdmin = createAdminClient()

    // First, manually delete the profile to ensure RLS doesn't interfere
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('[Delete API] Error deleting profile:', profileDeleteError)
      // Continue anyway, as the cascade delete from auth.users should handle it
    }

    // Delete user from auth.users
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('[Delete API] Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('[Delete API] Successfully deleted user:', userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Delete API] Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
