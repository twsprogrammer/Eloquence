import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  setDemoMode: (isDemo: boolean) => void;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_PROFILE: Profile = {
  id: 'demo-user-id',
  username: 'DemoUser',
  full_name: 'Linguistic Explorer',
  email: 'demo@eloquence.ai',
  role: 'admin',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (userId: string, email?: string, metadata?: any) => {
    if (!isSupabaseConfigured || isDemo) {
      if (isDemo) setProfile(MOCK_PROFILE);
      return;
    }
    console.log('Fetching profile for:', userId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
    );

    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        timeoutPromise
      ]) as any;
      
      if (data) {
        console.log('Profile found:', data.username);
        setProfile(data);
      } else if (error && (error.code === 'PGRST116' || error.message?.includes('timeout'))) {
        // Profile not found or timeout, handle creation or use default
        console.log('Profile not found or timeout, creating/using metadata');
        const defaultProfile: Profile = {
          id: userId,
          email: email || '',
          username: metadata?.username || email?.split('@')[0] || `user_${userId.substring(0, 5)}`,
          full_name: metadata?.full_name || metadata?.name || '',
          role: 'user',
          created_at: new Date().toISOString()
        };
        
        setProfile(defaultProfile);

        // Try creating it in background if not timeout
        if (error.code === 'PGRST116') {
          supabase.from('profiles').insert(defaultProfile).then(({ error: e }) => {
            if (e) console.error('Failed to create profile in background:', e);
          });
        }
      } else {
        throw error;
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      // Don't let profile error block auth
      setProfile({ id: userId, email: email || '', username: 'User', full_name: '', role: 'user', created_at: '' });
    }
  };

  useEffect(() => {
    if (isDemo) {
      setUser({ id: 'demo-user-id', email: 'demo@eloquence.ai' } as any);
      setProfile(MOCK_PROFILE);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      }
    }).catch(err => {
      console.error('Failed to get session:', err);
    }).finally(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth State Change:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  const refreshProfile = async () => {
    if (isDemo) return;
    if (user) await fetchProfile(user.id);
  };

  const setDemoMode = (demo: boolean) => {
    setIsDemo(demo);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, setDemoMode, isDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
