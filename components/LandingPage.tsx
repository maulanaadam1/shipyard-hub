'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Ship, Shield, BarChart3, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                Next-Gen Shipyard Management
              </span>
              <h1 className="font-display font-bold text-5xl md:text-7xl text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Master Your Fleet with <span className="text-teal-600">Precision</span>
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                The all-in-one platform for shipyard equipment tracking, maintenance scheduling, 
                and deployment management. Streamline your operations and reduce downtime.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold text-lg hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-2 group">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                  Watch Demo
                </button>
              </div>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Ship,
                title: "Fleet Tracking",
                desc: "Real-time visibility into your entire equipment inventory across multiple locations."
              },
              {
                icon: Shield,
                title: "Maintenance Guard",
                desc: "Automated scheduling and alerts for preventive maintenance to ensure safety."
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                desc: "Deep insights into equipment utilization and project deployment efficiency."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Assets Managed", value: "5,000+" },
              { label: "Active Projects", value: "120+" },
              { label: "Downtime Reduced", value: "35%" },
              { label: "Global Partners", value: "45" }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold text-teal-400 mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-teal-100 rounded-full -z-10"></div>
                <h2 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-8 leading-tight">
                  Designed for the Modern Shipyard Environment
                </h2>
              </div>
              <div className="space-y-6">
                {[
                  "Centralized equipment database with history",
                  "Automated loan and return workflows",
                  "Real-time deployment status tracking",
                  "Role-based access control for security",
                  "Comprehensive maintenance logs and alerts"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-slate-100 rounded-[2.5rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 aspect-video flex items-center justify-center relative group cursor-pointer">
                  <div className="absolute inset-0 bg-teal-600/10 group-hover:bg-teal-600/20 transition-colors"></div>
                  <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center text-teal-600 z-10 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-600/10 rounded-full blur-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 Shipyard Hub. All rights reserved. Built for excellence in maritime operations.
          </p>
        </div>
      </footer>
    </div>
  );
}
