import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { User, AtSign, Loader2, Save, CheckCircle2, Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        username: profile.username || '',
        avatarUrl: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select a file first.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback for demo: if bucket doesn't exist, use base64 for preview
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
           const reader = new FileReader();
           reader.onload = (e) => {
             const base64 = e.target?.result as string;
             setFormData(prev => ({ ...prev, avatarUrl: base64 }));
             setMessage({ type: 'success', text: 'Preview successful! (Save to update profile)' });
           };
           reader.readAsDataURL(file);
           return;
        }
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully! Don\'t forget to click save.' });
    } catch (err: any) {
      console.error('Error uploading:', err);
      setMessage({ type: 'error', text: `Upload failed: ${err.message}. Ensure the 'avatars' bucket exists and is public.` });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Build update object dynamically to allow partial updates
      const updateData: any = {};
      if (formData.fullName !== undefined) updateData.full_name = formData.fullName;
      if (formData.username !== undefined) updateData.username = formData.username;
      if (formData.avatarUrl !== undefined) updateData.avatar_url = formData.avatarUrl;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        if (error.message?.includes('avatar_url')) {
          throw new Error('Database error: The "avatar_url" column is missing. Please add it to your Supabase "profiles" table to use the photo feature.');
        }
        throw error;
      }
      
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
        <p className="text-clay/50 text-sm">Manage your profile and photos from your device</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[40px] border border-clay/5 shadow-sm"
      >
        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Avatar Section */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-bold tracking-widest text-clay/40 ml-4">Photo Profile</label>
            <div className="flex items-center gap-8 ml-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-maroon/5 border-2 border-maroon/10 flex items-center justify-center overflow-hidden shadow-inner">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-clay/20" />
                  )}
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 animate-spin text-maroon" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -right-1 -bottom-1 bg-maroon text-cream p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-10"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-serif text-lg mb-1">{profile?.username || 'User'}</h3>
                <p className="text-xs text-clay/50 mb-4">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-maroon hover:text-clay transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Choose New Photo
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-clay/40 ml-4">Email Address</label>
            <input
              disabled
              type="text"
              className="w-full px-6 py-4 bg-clay/5 border border-transparent rounded-2xl font-medium text-clay/40 cursor-not-allowed"
              value={user?.email || ''}
            />
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
            disabled={loading || uploading}
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
