import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// This is just for testing - shows Supabase client details
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return NextResponse.json({
    supabaseUrl,
    hasAnonKey,
    clientInitialized: true,
    timestamp: new Date().toISOString(),
  })
}
