import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('[Callback] Auth callback received')
  console.log('[Callback] Origin:', origin)
  console.log('[Callback] Code present:', !!code)
  console.log('[Callback] Next:', next)

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[Callback] Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        console.log('[Callback] User authenticated:', data.user.email)

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      // If no profile exists, create one with default role 'readonly'
      if (!profile && profileError?.code === 'PGRST116') {
        // PGRST116 = not found error
        console.log('Creating new profile for user:', data.user.email)
        const { error: insertError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || null,
          role: 'readonly', // Default role untuk user baru: readonly
        })

        if (insertError) {
          console.error('Error creating profile:', insertError)
        }
      } else if (profileError) {
        console.warn('[Callback] Error checking profile:', profileError.message)
      } else {
        console.log('[Callback] Profile found for user:', profile?.email)
      }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        console.log('[Callback] Redirecting to:', next, 'environment:', isLocalEnv ? 'development' : 'production')

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch (err: any) {
      console.error('[Callback] Unexpected error in callback:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error&message=${encodeURIComponent(err?.message || 'Unknown error')}`)
    }
  }

  // return the user to an error page with instructions
  console.error('[Callback] No code provided or no user in session')
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
