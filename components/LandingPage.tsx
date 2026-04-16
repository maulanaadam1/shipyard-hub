'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ship, Lock, Mail, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function LandingPage() {
  const { setCurrentUser } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      // Mock login - in a real app this would call Supabase auth
      setCurrentUser({
        id: '1',
        name: 'Adam Maulana',
        email: email || 'maulana.adam1@gmail.com',
        role: 'Admin'
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#FDB913 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FDB913]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FDB913]/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-12 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-[#FDB913] rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-[#FDB913]/20">
              <Ship className="w-10 h-10 text-slate-900" />
            </div>
            <h1 className="font-display font-bold text-5xl text-white mb-6 leading-tight">
              Shipyard <br/>
              <span className="text-[#FDB913]">Management Hub</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              The all-in-one platform for shipyard equipment tracking, maintenance scheduling, 
              and deployment management. Streamline your operations and reduce downtime.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="lg:hidden w-16 h-16 bg-[#FDB913] rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-[#FDB913]/20">
              <Ship className="w-8 h-8 text-slate-900" />
            </div>
            
            <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-8">Please enter your credentials to access your account.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/50 focus:border-[#FDB913] transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-[#FDB913] hover:text-[#e5a611] transition-colors">Forgot Password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FDB913]/50 focus:border-[#FDB913] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3.5 bg-[#FDB913] text-slate-900 rounded-xl font-bold text-sm hover:bg-[#e5a611] transition-all shadow-lg shadow-[#FDB913]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account? <a href="#" className="font-bold text-[#FDB913] hover:text-[#e5a611] transition-colors">Contact Administrator</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
