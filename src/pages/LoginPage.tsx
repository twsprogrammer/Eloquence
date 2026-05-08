import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Info, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, setDemoMode } = useAuth();

  useEffect(() => {
    // If we have a user and they're fully loaded in the hook, move to app
    if (user && !authLoading) {
      navigate('/app');
    }

    const handleMessage = (event: MessageEvent) => {
      // Very permissive during debug, or check if it contains our specific type
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        console.log('Login success message received from:', event.origin);
        setLoading(false);
        navigate('/app');
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setLoading(false);
        setError(event.data.message || 'Authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Please use Demo Mode to preview the app.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Use standard redirect for better compatibility if not in a popup-friendly env
      // But we'll still try popup first as it's better for iFrame
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Changed from consent to select_account for better UX
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Use a descriptive name for the window
        const authWindow = window.open(
          data.url,
          'eloquence_auth',
          'width=600,height=700,scrollbars=yes,status=yes'
        );

        if (!authWindow) {
          setLoading(false);
          setError('Popup diblokir. Harap izinkan popup untuk situs ini atau klik tombol Refresh Status di bawah jika Anda sudah login di tab lain.');
          return;
        }

        // Failsafe: Check session every few seconds
        const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setLoading(false);
            navigate('/app');
            return true;
          }
          return false;
        };

        const interval = setInterval(async () => {
          const found = await checkSession();
          if (found) {
            clearInterval(interval);
          } else if (authWindow.closed) {
            clearInterval(interval);
            // Wait slightly for any final redirect to finish
            setTimeout(async () => {
              const finallyFound = await checkSession();
              if (!finallyFound) setLoading(false);
            }, 1000);
          }
        }, 1000);

        // Also listener
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            clearInterval(interval);
            window.removeEventListener('message', handleMessage);
            setLoading(false);
            navigate('/app');
          }
        };
        window.addEventListener('message', handleMessage);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Gagal memulai login Google.');
    }
  };

  const verifySessionManually = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/app');
    } else {
      setLoading(false);
      setError('Sesi belum ditemukan. Silakan coba login kembali atau pastikan Anda sudah memilih akun di popup.');
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row overflow-hidden">
      {/* Visual Side */}
      <div className="hidden md:flex flex-1 bg-maroon relative p-12 flex-col justify-between">
        <Link to="/" className="text-cream flex items-center gap-2 group z-20">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back Home</span>
        </Link>
        
        <div className="max-w-md relative z-20">
           <h2 className="text-6xl font-serif text-cream mb-8 leading-none">The art of <span className="italic">proper</span> expression.</h2>
           <p className="text-cream/60 text-lg leading-relaxed">Join a community of thousands improving their English through context and natural conversation.</p>
        </div>

        <div className="flex items-center gap-2 relative z-20">
            <span className="text-3xl font-serif text-cream font-black">E</span>
            <span className="text-xl font-serif font-bold text-cream">Eloquence</span>
         </div>

         <div className="absolute top-1/2 left-full -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white md:bg-transparent overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-10 md:p-14 rounded-[40px] shadow-2xl md:shadow-maroon/5 relative text-center"
        >
          {!isSupabaseConfigured && (
            <div className="mb-8 p-4 bg-maroon/5 border border-maroon/10 rounded-2xl flex gap-3 items-start text-left">
              <Info className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-maroon mb-1">Preview Mode Active</p>
                <p className="text-[10px] text-maroon/60 leading-relaxed">
                  Supabase keys are not set. You can use <strong>Demo Mode</strong> to explore the app interface without a real account.
                </p>
                <button 
                  onClick={handleDemoMode}
                  className="mt-2 text-[10px] font-black text-maroon underline underline-offset-2 hover:text-maroon-light transition-colors"
                >
                  Enter Demo Mode →
                </button>
              </div>
            </div>
          )}

          <header className="mb-12">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div
                  key="welcome-back"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <h1 className="text-4xl font-serif mb-3">Welcome back</h1>
                  <p className="text-clay/40 text-sm mb-8">
                    You are signed in as <span className="text-maroon font-bold">{user.email}</span>
                  </p>
                  <button
                    onClick={() => navigate('/app')}
                    className="w-full bg-maroon text-cream py-4 rounded-2xl font-bold shadow-xl shadow-maroon/20 hover:bg-maroon-light transition-all flex items-center justify-center gap-2 group"
                  >
                    Go to Dashboard
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="sign-in"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <h1 className="text-4xl font-serif mb-3">Get Started</h1>
                  <p className="text-clay/40 text-sm">
                    Sign in with your Google account to continue
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {!user && (
            <div className="space-y-6">
              <button
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full bg-white border-2 border-clay/5 py-4 rounded-2xl font-bold hover:border-maroon/20 hover:bg-cream/30 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-maroon" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        style={{ fill: '#4285F4' }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        style={{ fill: '#34A853' }}
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        style={{ fill: '#FBBC05' }}
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        style={{ fill: '#EA4335' }}
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {error && (
                <div className="space-y-4">
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
                  >
                    {error}
                  </motion.p>
                  
                  <div className="p-4 bg-maroon/5 rounded-2xl text-left border border-maroon/10">
                    <p className="text-[10px] font-bold text-maroon mb-2 uppercase tracking-wide">PENTING: Cek Supabase Kamu</p>
                    <p className="text-[10px] text-clay/70 leading-relaxed mb-3">
                      Pastikan <strong>Redirect URL</strong> di Supabase adalah:
                    </p>
                    <div className="bg-white p-2 rounded border border-maroon/10 text-[9px] font-mono break-all select-all">
                      {window.location.origin}/auth/callback
                    </div>
                    <p className="text-[9px] text-maroon/50 mt-2 italic">
                      *Jika URL di atas tidak sama dengan yang ada di Supabase, login Google tidak akan bisa masuk.
                    </p>
                  </div>

                  <button
                    onClick={verifySessionManually}
                    className="w-full bg-maroon text-cream py-3 rounded-xl text-xs font-bold hover:bg-maroon-light transition-all"
                  >
                    Refresh Status Login
                  </button>
                </div>
              )}
            </div>
          )}

          <footer className="mt-12 text-center space-y-6">
            <div className={cn(
              "pt-6 border-t border-clay/5 transition-all duration-500",
              error ? "bg-maroon/5 -mx-10 px-10 rounded-b-[40px]" : ""
            )}>
               <p className="text-[10px] text-clay/20 uppercase tracking-widest font-bold mb-3">
                 {error ? "Bypass login for now" : "Or explore immediately"}
               </p>
               <button 
                 onClick={handleDemoMode} 
                 className={cn(
                   "px-8 py-3 rounded-2xl border transition-all uppercase tracking-widest text-[10px] font-black",
                   error 
                    ? "bg-maroon text-cream border-transparent shadow-lg shadow-maroon/20 hover:bg-maroon-light" 
                    : "border-clay/10 text-clay/40 hover:text-maroon hover:border-maroon/20 hover:bg-maroon/5"
                 )}
               >
                 Enter Demo Mode
               </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
