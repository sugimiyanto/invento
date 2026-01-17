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

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
    console.log('[Auth] Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Auth] Error fetching profile:', error);
      return null;
    }

    console.log('[Auth] Profile fetched successfully:', data);
    return data;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth] Session:', session ? 'exists' : 'null');

        if (session?.user) {
          console.log('[Auth] User exists in session:', session.user.email);
          setSupabaseUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            console.log('[Auth] Setting user profile:', profile.email);
            setUser(profile);
          } else {
            console.log('[Auth] No profile found for user');
          }
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        console.log('[Auth] Init complete');
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event, session ? 'has session' : 'no session');
        if (session?.user) {
          setSupabaseUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
          }
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
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
