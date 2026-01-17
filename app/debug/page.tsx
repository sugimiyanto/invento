'use client'

import { useAuth } from '@/lib/context/auth-context'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { user, supabaseUser, isAuthenticated, isLoading } = useAuth()
  const [supabseUrl, setSupabaseUrl] = useState('')

  useEffect(() => {
    // Check what the client-side Supabase config is
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    setSupabaseUrl(url || 'NOT SET')
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Debug Page</h1>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
              <div className="bg-gray-50 p-2 rounded mt-1 break-all">{supabseUrl}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auth Context State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div>
              <strong>isLoading:</strong> {isLoading ? 'true' : 'false'}
            </div>
            <div>
              <strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}
            </div>
            <div>
              <strong>user:</strong>
              <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
            <div>
              <strong>supabaseUser:</strong>
              <pre className="bg-gray-50 p-2 rounded mt-1 overflow-auto text-xs">
                {supabaseUser ? JSON.stringify(supabaseUser, null, 2) : 'null'}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What to Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Browser Console:</strong> Open DevTools (F12) → Console tab and look for [Auth] messages
              </li>
              <li>
                <strong>Network Tab:</strong> Check if a request to accounts.google.com happens when you click login
              </li>
              <li>
                <strong>Supabase OAuth Setup:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Go to Supabase Dashboard</li>
                  <li>Navigate to Authentication → Providers</li>
                  <li>Click Google provider</li>
                  <li>Make sure these redirect URIs are configured:
                    <ul className="list-circle list-inside ml-4 mt-1">
                      <li>http://localhost:3000/auth/callback</li>
                      <li>http://127.0.0.1:3000/auth/callback</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
