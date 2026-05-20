'use client';

import { Flame, ShieldCheck, Trophy, Sparkles, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-24 font-inter relative overflow-hidden flex flex-col justify-between">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 py-16 space-y-20 relative z-10">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold-premium/10 border border-gold-premium/20 rounded-full">
              <Flame className="w-4 h-4 text-gold-premium animate-pulse" />
              <span className="font-barlow text-[11px] font-black uppercase text-gold-premium tracking-widest">
                Our Genesis & Mission
              </span>
            </div>
            <h1 className="font-bebas text-5xl sm:text-7xl text-white uppercase tracking-wider leading-none">
              Forge Your Legacy inside the <span className="text-gold-premium">Arena</span>
            </h1>
            <p className="text-gray-400 font-inter text-base sm:text-lg leading-relaxed">
              We don't build average race tracks. We construct extreme military-grade obstacle battlegrounds designed to push your physical endurance, mental fortitude, and human spirit to the absolute limit.
            </p>
          </div>

          {/* Stats Dashboard Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { label: 'Obstacles Conquered', val: '250,000+' },
              { label: 'Active Gladiators', val: '15,000+' },
              { label: 'Military Instructors', val: '45+' },
              { label: 'Cities Conquered', val: '8+' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-dark-gray/30 border border-white/5 rounded-lg p-6 text-center space-y-2">
                <span className="font-bebas text-3xl sm:text-4xl text-gold-premium block font-black">{stat.val}</span>
                <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Core Values grid */}
          <div className="space-y-10 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
              <h2 className="font-bebas text-4xl text-white uppercase tracking-wide">Our Creed</h2>
              <p className="text-gray-500 font-barlow text-xs uppercase tracking-widest">The values we run, fight, and win by</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Raw Endurance', 
                  desc: 'We train athletes to push beyond arbitrary limitations, building muscular endurance and dynamic cardiac output that survives the mud.', 
                  icon: Trophy 
                },
                { 
                  title: 'Unbreakable Honor', 
                  desc: 'We foster a global community of respect, dynamic safety policies, mutual camaraderie, and elite sportsmanship at every obstacle.', 
                  icon: ShieldCheck 
                },
                { 
                  title: 'True Brotherhood', 
                  desc: 'Nobody is left behind in the pits. Every obstacle is built to be solved, scaled, and completed together as one pack.', 
                  icon: Target 
                }
              ].map((val, idx) => (
                <div key={idx} className="bg-dark-gray/30 border border-white/5 rounded-lg p-8 space-y-4 hover:border-gold-premium/30 transition-all duration-300 relative group">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:gold-gradient-bg transition-all duration-300" />
                  <div className="w-12 h-12 rounded bg-gold-premium/10 flex items-center justify-center text-gold-premium mb-4 group-hover:scale-110 transition-transform duration-300">
                    <val.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bebas text-2xl text-white uppercase tracking-wider">{val.title}</h3>
                  <p className="text-gray-400 text-sm font-inter leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Section */}
          <div className="border border-gold-premium/20 bg-gold-premium/5 rounded-xl p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg animate-pulse" />
            <h2 className="font-bebas text-4xl sm:text-5xl text-white uppercase tracking-wider">
              Are you ready to hunt?
            </h2>
            <p className="text-gray-400 font-inter text-sm max-w-md mx-auto leading-relaxed">
              Unlock the beast inside. Sign up for our upcoming challenges and put your limits to the test.
            </p>
            <div className="pt-4">
              <Link
                href="/events"
                className="inline-flex gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-8 py-3.5 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.4)] items-center space-x-1.5"
              >
                <span>Browse Upcoming Races</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
}
