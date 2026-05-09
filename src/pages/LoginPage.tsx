import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Info, LogIn, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If we have a user and they're fully loaded in the hook, move to app
    if (user && !authLoading) {
      navigate('/app');
    }
  }, [user, authLoading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
            }
          }
        });
        if (signUpError) throw signUpError;
        setError("Berhasil daftar! Silakan cek email Anda untuk konfirmasi (jika diaktifkan) atau coba masuk.");
        setMode('signin');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
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
          className="w-full max-w-sm bg-white p-10 md:p-14 rounded-[40px] shadow-2xl md:shadow-maroon/5 relative"
        >
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-serif mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-clay/40 text-sm">
              {mode === 'signin' 
                ? 'Sign in to your account' 
                : 'Start your journey with us today'}
            </p>
          </header>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-maroon uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cream/30 border-2 border-transparent focus:border-maroon/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-maroon uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream/30 border-2 border-transparent focus:border-maroon/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-clay/40 hover:text-maroon transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-cream py-4 rounded-2xl font-bold shadow-xl shadow-maroon/20 hover:bg-maroon-light transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-clay/5 text-center">
            <button 
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-xs text-clay/60 hover:text-maroon transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
