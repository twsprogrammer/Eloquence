import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Mail,
  User as UserIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types';

export default function AdminPanelPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    // In a real app with Supabase Admin, you'd use supabase.auth.admin.deleteUser(id)
    // Here we can only delete from profiles table unless we have service role
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
       setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif">Admin Management</h1>
          <p className="text-clay/50 text-sm">Monitor and manage Eloquence users</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-6 rounded-3xl border border-clay/5 shadow-sm text-center min-w-[140px]">
              <p className="text-[10px] uppercase font-bold tracking-widest text-clay/30 mb-1">Total Users</p>
              <p className="text-3xl font-serif text-maroon">{profiles.length}</p>
           </div>
        </div>
      </header>

      <section className="bg-white rounded-[40px] border border-clay/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-clay/5 flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-clay/30" />
              <input 
                 type="text" 
                 placeholder="Search by name, username or email..." 
                 className="w-full pl-14 pr-6 py-4 bg-cream/30 rounded-full border border-clay/5 focus:outline-none focus:ring-1 focus:ring-maroon/20 focus:bg-white transition-all text-sm"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button 
             onClick={() => { setEditingProfile(null); setIsModalOpen(true); }}
             className="bg-maroon text-cream px-8 py-4 rounded-full text-sm font-bold shadow-lg shadow-maroon/20 hover:scale-105 transition-all flex items-center gap-2"
           >
              <UserPlus className="w-4 h-4" /> Add User
           </button>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-cream/50 text-[10px] uppercase font-black tracking-[0.2em] text-clay/30">
                    <th className="px-8 py-6">User</th>
                    <th className="px-8 py-6">Username</th>
                    <th className="px-8 py-6">Role</th>
                    <th className="px-8 py-6">Joined</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-clay/5">
                 {loading ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-20 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-maroon mx-auto" />
                       </td>
                    </tr>
                 ) : filteredProfiles.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-20 text-center text-clay/40 font-serif italic">
                          No users found...
                       </td>
                    </tr>
                 ) : (
                    filteredProfiles.map((p) => (
                       <tr key={p.id} className="hover:bg-cream/30 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-clay/5 flex items-center justify-center font-bold text-maroon">
                                   {p.full_name?.[0]}
                                </div>
                                <div>
                                   <p className="font-bold text-sm">{p.full_name}</p>
                                   <p className="text-xs text-clay/40">{p.email}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-xs font-mono bg-clay/5 px-3 py-1 rounded-full text-clay/60">@{p.username}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className={cn(
                                "flex items-center gap-2 text-xs font-bold",
                                p.role === 'admin' ? "text-maroon" : "text-clay/60"
                             )}>
                                {p.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                {p.role?.toUpperCase()}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-xs text-clay/40">
                             {new Date(p.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => { setEditingProfile(p); setIsModalOpen(true); }}
                                  className="p-2 hover:bg-maroon/10 text-maroon rounded-lg transition-colors border border-transparent hover:border-maroon/20"
                                >
                                   <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(p.id)}
                                  className="p-2 hover:bg-black text-clay/20 hover:text-white rounded-lg transition-all"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </section>

      {/* User Modal Placeholder */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-12">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-maroon/10 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-12 overflow-hidden"
             >
                <button 
                   onClick={() => setIsModalOpen(false)}
                   className="absolute top-8 right-8 p-2 text-clay/20 hover:text-maroon transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-3xl font-serif mb-2">{editingProfile ? 'Edit User' : 'New User'}</h2>
                <p className="text-sm text-clay/40 mb-10">{editingProfile ? 'Refine user properties' : 'Create a manual account access'}</p>

                <div className="space-y-6">
                   <p className="p-8 border border-dashed border-clay/10 rounded-3xl text-center text-clay/40 text-sm font-serif italic">
                      User creation and specific edits are restricted in this demonstration. <br/>
                      Admin panel provides full visibility of the user base.
                   </p>
                   <button 
                     onClick={() => setIsModalOpen(false)}
                     className="w-full bg-maroon text-cream py-4 rounded-2xl font-bold hover:bg-maroon-light transition-all"
                   >
                     Close Panel
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
