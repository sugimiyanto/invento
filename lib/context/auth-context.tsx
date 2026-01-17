'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/product';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch or create user profile from profiles table with retry logic
  const fetchUserProfile = async (userId: string, userEmail?: string, userName?: string) => {
    const maxRetries = 3;
    const retryDelay = 500; // ms

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[Auth] Fetching profile for user: ${userId} (attempt ${attempt + 1}/${maxRetries})`);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          // Profile tidak ada, coba create otomatis (fallback jika trigger belum jalan)
          if (error.code === 'PGRST116') {
            console.log('[Auth] Profile tidak ada, membuat profile baru...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: userEmail || '',
                full_name: userName || userEmail?.split('@')[0] || 'User',
                role: 'readonly'
              })
              .select()
              .single();

            if (createError) {
              console.warn('[Auth] Gagal membuat profile:', createError.message);
              return null;
            }

            console.log('[Auth] Profile baru berhasil dibuat:', newProfile.email);
            return newProfile;
          }

          console.warn('[Auth] Profile tidak dapat diakses:', error.message);
          return null;
        }

        console.log('[Auth] Profile fetched successfully:', data?.email);
        return data;
      } catch (err) {
        console.warn(`[Auth] Error fetching profile (attempt ${attempt + 1}):`, err);

        // Retry dengan delay jika masih ada attempt tersisa
        if (attempt < maxRetries - 1) {
          console.log(`[Auth] Retrying after ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.warn('[Auth] Failed to fetch profile after', maxRetries, 'attempts');
    return null;
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth] Initial session check:', session ? 'has session' : 'no session');

        if (isMounted) {
          if (session?.user) {
            console.log('[Auth] User exists in session:', session.user.email);
            setSupabaseUser(session.user);
            const profile = await fetchUserProfile(
              session.user.id,
              session.user.email,
              session.user.user_metadata?.full_name || session.user.user_metadata?.name
            );
            if (profile) {
              console.log('[Auth] Setting user profile:', profile.email);
              setUser(profile);
            } else {
              console.log('[Auth] No profile found for user, but keeping authenticated state');
              // Keep the user authenticated even if profile fetch fails
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                role: 'readonly'
              } as any);
            }
          } else {
            console.log('[Auth] No session found');
            setSupabaseUser(null);
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[Auth] Error during initialization:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Set a timeout as a safety net - max 10 seconds to check session and fetch profile
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('[Auth] Session check timeout - setting isLoading to false');
        setIsLoading(false);
      }
    }, 10000);

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[Auth] Auth state changed:', event, session ? 'has session' : 'no session');

        if (session?.user) {
          console.log('[Auth] User exists in session:', session.user.email);
          setSupabaseUser(session.user);
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
          if (profile) {
            console.log('[Auth] Setting user profile:', profile.email);
            setUser(profile);
          } else {
            console.log('[Auth] No profile found for user, but keeping authenticated state');
            // Keep the user authenticated even if profile fetch fails
            // The profile will be created or fetched on next attempt
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              role: 'readonly'
            } as any);
          }
        } else {
          console.log('[Auth] No session found');
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
        // Clear the timeout once we've processed the auth state
        clearTimeout(timeoutId);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('[Auth] Starting Google OAuth signin...');
      console.log('[Auth] OAuth redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('[Auth] OAuth error:', error);
        throw new Error(`OAuth failed: ${error.message}`);
      }

      console.log('[Auth] OAuth initiated, awaiting redirect to:', redirectUrl);
    } catch (err: any) {
      console.error('[Auth] Error in signInWithGoogle:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        signInWithGoogle,
        signOut,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
