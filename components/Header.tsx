'use client';

import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, UserCircle, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { currentUser, setCurrentUser } = useData();
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);
  const loadingRef = React.useRef(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Supabase is configured
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder');
    if (isPlaceholder || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setAuthError('Supabase is not configured. Please set your API keys in the Settings menu.');
      return;
    }

    setAuthError('');
    setSuccessMessage('');
    setIsAuthLoading(true);
    loadingRef.current = true;
    
    const authTimeout = setTimeout(() => {
      if (loadingRef.current) {
        setAuthError('Connection timeout (30s). Please verify your Supabase URL and Anon Key.');
        setIsAuthLoading(false);
        loadingRef.current = false;
      }
    }, 30000);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsLoginModalOpen(false);
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          await supabase.from('profiles').upsert({ 
            id: authData.user.id, 
            name: email.split('@')[0], 
            email: email, 
            role: 'Staff' 
          }, { onConflict: 'id' });
        }
        
        setSuccessMessage('Account created! You can now sign in.');
        setAuthMode('login');
        setPassword('');
        return;
      }
      setEmail('');
      setPassword('');
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      clearTimeout(authTimeout);
      setIsAuthLoading(false);
      loadingRef.current = false;
    }
  };

  const handleSupabaseLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsUserSwitcherOpen(false);
  };

  return (
    <header className="h-16 bg-teal-600 text-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 md:gap-8">
        {currentUser && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-teal-500 rounded-lg transition-colors flex flex-col items-center justify-center gap-1.5"
          >
            <div className="w-6 h-0.5 bg-white rounded-full"></div>
            <div className="w-6 h-0.5 bg-white rounded-full"></div>
            <div className="w-6 h-0.5 bg-white rounded-full"></div>
          </button>
        )}
        <h1 className="font-display font-bold text-lg md:text-xl tracking-tight truncate max-w-[200px] sm:max-w-none">
          Shipyard Hub
        </h1>
        <div className="hidden lg:flex items-center bg-teal-700/50 rounded-full px-4 py-1.5 gap-2 border border-teal-500/30">
          <Search className="w-4 h-4 text-teal-200" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="bg-transparent border-none outline-none text-sm placeholder:text-teal-300 w-32 xl:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {currentUser && (
          <button className="relative p-2 hover:bg-teal-500 rounded-full transition-colors hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-teal-600"></span>
          </button>
        )}
        
        {!currentUser ? (
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="p-2 bg-teal-500 hover:bg-teal-400 rounded-full transition-all border border-teal-400 shadow-sm flex items-center justify-center"
            title="Login"
          >
            <UserCircle className="w-6 h-6" />
          </button>
        ) : (
          <div className="relative">
            <button 
              onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
              className="flex items-center gap-3 pl-4 border-l border-teal-500/50 hover:opacity-80 transition-opacity"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-teal-200 uppercase tracking-wider font-bold mt-1">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center border-2 border-teal-400 overflow-hidden shrink-0 relative">
                {currentUser.avatar ? (
                  <Image 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-teal-100" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isUserSwitcherOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {currentUser.name}
                    </p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={handleSupabaseLogout}
                      className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-800"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-display font-bold text-xl text-slate-800">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <button onClick={() => setIsLoginModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="p-8 space-y-4">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
                    {authError}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 bg-teal-50 border border-teal-100 text-teal-600 text-xs rounded-xl font-medium">
                    {successMessage}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
                >
                  {isAuthLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
