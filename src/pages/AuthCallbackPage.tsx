import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  useEffect(() => {
    // 1. First attempt: Send postMessage if we have a session
    const checkAndNotify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthCallback: Session found?', !!session);
      
      if (session) {
        if (window.opener) {
          console.log('AuthCallback: Notifying opener');
          try {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            // Give time for message to arrive before closing
            setTimeout(() => window.close(), 1000);
          } catch (e) {
            console.error('AuthCallback: postMessage failed', e);
            window.location.href = '/app';
          }
        } else {
          console.log('AuthCallback: No opener, redirecting');
          window.location.href = '/app';
        }
        return true;
      }
      return false;
    };

    // 2. Initial check
    checkAndNotify();

    // 3. Listen for state changes (e.g. when fragment is processed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthCallback Event:', event);
      if (session) {
        await checkAndNotify();
      }
    });

    // 4. Maximum wait time fallback
    const timer = setTimeout(() => {
      console.log('AuthCallback: Exiting after timeout');
      if (window.opener) {
        window.close();
      } else {
        window.location.href = '/app';
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-8 text-center">
      <div className="space-y-6 max-w-sm">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div>
          <h1 className="text-2xl font-serif text-maroon mb-2">Authenticating...</h1>
          <p className="text-clay/60 text-sm">Please wait while we complete your sign-in.</p>
        </div>
        
        <div className="pt-8 border-t border-maroon/10">
          <p className="text-[10px] text-clay/30 uppercase tracking-widest font-bold mb-4">Stuck?</p>
          <button 
            onClick={() => window.location.href = '/app'}
            className="w-full bg-maroon text-cream py-3 rounded-xl font-bold hover:bg-maroon-light transition-colors"
          >
            Go to Dashboard Manually
          </button>
        </div>
      </div>
    </div>
  );
}
