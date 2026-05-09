import React from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Languages, 
  Sparkles, 
  BookOpen, 
  Search,
  MessageSquare, 
  Hash, 
  Zap, 
  LogOut,
  ChevronRight,
  ShieldAlert,
  UserCircle,
  History
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/history', icon: History, label: 'History' },
  { to: '/app/smart-translate', icon: Languages, label: 'Smart Translate' },
  { to: '/app/fix-improve', icon: Sparkles, label: 'Fix & Improve' },
  { to: '/app/word-insight', icon: BookOpen, label: 'Word Insight' },
  { to: '/app/synonym-finder', icon: Search, label: 'Synonym Finder' },
  { to: '/app/quick-reply', icon: MessageSquare, label: 'Quick Reply' },
  { to: '/app/slang-decoder', icon: Hash, label: 'Slang Decoder' },
  { to: '/app/level-simplifier', icon: Zap, label: 'Level Simplifier' },
  { to: '/app/profile', icon: UserCircle, label: 'My Profile' },
];

export default function AppLayout() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-cream text-clay">
      {/* Sidebar */}
      <aside className="w-64 border-r border-clay/10 flex flex-col bg-white">
        <div className="p-6 border-bottom border-clay/5">
          <h1 className="text-2xl font-serif tracking-tight flex items-center gap-2">
            <span className="text-maroon font-black">E</span>
            <span>Eloquence</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-maroon text-cream shadow-md shadow-maroon/20" 
                  : "text-clay/60 hover:bg-cream hover:text-maroon"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {profile?.role === 'admin' && (
            <div className="pt-8">
              <p className="px-4 text-[10px] uppercase tracking-widest text-clay/40 font-bold mb-2">Admin Panel</p>
              <NavLink
                to="/app/admin"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-maroon text-cream shadow-md shadow-maroon/20" 
                    : "text-clay/60 hover:bg-cream hover:text-maroon"
                )}
              >
                <ShieldAlert className="w-5 h-5" />
                <span className="font-medium">Management</span>
              </NavLink>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-clay/10">
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                profile?.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-clay/50 truncate">@{profile?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-maroon hover:bg-maroon/5 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-cream/50 relative">
        <header className="sticky top-0 z-10 px-8 py-4 backdrop-blur-md bg-cream/80 border-b border-clay/5 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-clay/40">Workspace</span>
           </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
