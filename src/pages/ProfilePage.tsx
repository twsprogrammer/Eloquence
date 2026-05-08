import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { User, AtSign, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        username: profile.username || ''
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-serif">Account Settings</h1>
        <p className="text-clay/50 text-sm">Manage your profile and presence</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] border border-clay/5 shadow-sm"
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-clay/40 ml-4">Email Address</label>
            <input
              disabled
              type="text"
              className="w-full px-6 py-4 bg-clay/5 border border-transparent rounded-2xl font-medium text-clay/40 cursor-not-allowed"
              value={user?.email || ''}
            />
            <p className="text-[10px] text-clay/30 ml-4 italic">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-clay/40 ml-4">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay/30 group-focus-within:text-maroon transition-colors" />
              <input
                required
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-cream/50 border border-transparent focus:border-maroon/20 focus:bg-white focus:outline-none rounded-2xl transition-all font-medium"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-clay/40 ml-4">Username</label>
            <div className="relative group">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay/30 group-focus-within:text-maroon transition-colors" />
              <input
                required
                type="text"
                className="w-full pl-12 pr-6 py-4 bg-cream/50 border border-transparent focus:border-maroon/20 focus:bg-white focus:outline-none rounded-2xl transition-all font-medium"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          {message && (
             <div className={cn(
               "p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium",
               message.type === 'success' ? "bg-maroon/5 border-maroon/10 text-maroon" : "bg-red-50 border-red-100 text-red-600"
             )}>
                {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                {message.text}
             </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-maroon text-cream py-4 rounded-2xl font-bold shadow-xl shadow-maroon/20 hover:bg-maroon-light transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
