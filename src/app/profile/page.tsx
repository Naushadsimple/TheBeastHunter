'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Settings, 
  Ticket, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  LogOut, 
  ShieldCheck, 
  Loader2, 
  UserCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function ProfileContent() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'passes' | 'settings'>('passes');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'male',
    city: '',
    date_of_birth: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Get user session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push('/login?return_to=/profile');
          return;
        }

        setUser(authUser);

        // 2. Get profile details from public.users
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            name: userProfile.name || '',
            phone: userProfile.phone || '',
            gender: userProfile.gender || 'male',
            city: userProfile.city || '',
            date_of_birth: userProfile.date_of_birth || '',
          });
        }

        // 3. Get registrations with event details
        const { data: regs, error: regsError } = await supabase
          .from('registrations')
          .select('*, event_id(*)')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (regs) {
          setRegistrations(regs);
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          city: formData.city,
          date_of_birth: formData.date_of_birth || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile((prev: any) => ({ ...prev, ...formData }));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
        <h2 className="font-bebas text-2xl tracking-widest text-white uppercase animate-pulse">Loading Profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-inter relative z-10">
      
      {/* Top Banner Dashboard Header */}
      <div className="bg-dark-gray/30 border border-white/5 backdrop-blur-md rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />
        
        {/* User Card */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full gold-gradient-bg p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <div className="w-full h-full bg-[#0B0B0B] rounded-full flex items-center justify-center text-white">
              <UserCircle className="w-14 h-14 text-gold-premium/80" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase">
              {profile?.name || 'Warrior'}
            </h1>
            <p className="text-gray-400 font-barlow text-sm uppercase tracking-widest flex items-center justify-center sm:justify-start space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-gold-premium" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Action Button Controls */}
        <button
          onClick={handleSignOut}
          className="bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 font-barlow text-sm font-bold uppercase tracking-wider px-5 py-2.5 rounded transition-all duration-300 flex items-center space-x-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-3">
          <button
            onClick={() => setActiveTab('passes')}
            className={`w-full text-left font-bebas text-lg tracking-wider uppercase px-4 py-3 rounded flex items-center justify-between transition-all duration-300 ${
              activeTab === 'passes'
                ? 'gold-gradient-bg text-black font-black'
                : 'bg-dark-gray/30 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Ticket className="w-5 h-5" />
              <span>My Event Passes</span>
            </span>
            <span className="bg-black/15 text-xs font-barlow font-bold px-2 py-0.5 rounded">
              {registrations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left font-bebas text-lg tracking-wider uppercase px-4 py-3 rounded flex items-center justify-between transition-all duration-300 ${
              activeTab === 'settings'
                ? 'gold-gradient-bg text-black font-black'
                : 'bg-dark-gray/30 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Profile Settings</span>
            </span>
          </button>
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: PASSES */}
          {activeTab === 'passes' && (
            <div className="space-y-6">
              <h2 className="font-bebas text-3xl text-white tracking-wider uppercase border-b border-white/10 pb-2">
                Registered Challenges
              </h2>

              {registrations.length === 0 ? (
                <div className="bg-dark-gray/30 border border-white/5 rounded-lg p-12 text-center space-y-6">
                  <Ticket className="w-16 h-16 text-gray-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-bebas text-2xl text-white tracking-wide uppercase">No Active Tickets</h3>
                    <p className="text-gray-400 text-sm font-inter max-w-sm mx-auto leading-relaxed">
                      You haven't registered for any fitness events yet. Step up, pick your battle, and lock in your legacy!
                    </p>
                  </div>
                  <Link
                    href="/events"
                    className="inline-flex gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-6 py-3 rounded hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Explore Challenges
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {registrations.map(reg => (
                    <div 
                      key={reg.id} 
                      className="bg-dark-gray/30 border border-white/5 rounded-lg overflow-hidden flex flex-col md:flex-row relative group"
                    >
                      {/* Event Banner */}
                      <div className="md:w-48 h-32 md:h-auto bg-gray-900 relative shrink-0">
                        {reg.event_id?.banner_url ? (
                          <img 
                            src={reg.event_id.banner_url} 
                            alt={reg.event_id.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Flame className="w-8 h-8 text-gold-premium/45 animate-pulse" />
                          </div>
                        )}
                        {/* Shimmer Overlay */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-barlow font-bold text-gold-premium tracking-wider uppercase">
                          {reg.event_id?.difficulty || 'Intermediate'}
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bebas text-2xl text-white tracking-wide uppercase group-hover:text-gold-premium transition-colors duration-300">
                            {reg.event_id?.title}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-inter">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-gold-premium" />
                              <span>
                                {reg.event_id?.event_date 
                                  ? new Date(reg.event_id.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : 'TBA'
                                }
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-gold-premium" />
                              <span>{reg.event_id?.venue || 'Venue TBA'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Order status badges */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                          <div className="flex items-center space-x-3">
                            <div>
                              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Status</span>
                              <span className={`inline-block text-[10px] font-barlow font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                                reg.status === 'confirmed'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                  : reg.status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}>
                                {reg.status}
                              </span>
                            </div>
                            <div>
                              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Reg Code</span>
                              <span className="font-barlow text-xs font-bold text-gray-300 uppercase">
                                {reg.registration_code}
                              </span>
                            </div>
                          </div>

                          {reg.status === 'confirmed' && (
                            <Link
                              href={`/payment/success?order_id=${reg.registration_code.replace('REG-', 'TBH-')}`}
                              className="font-barlow text-xs font-black uppercase tracking-wider text-black bg-gold-premium hover:bg-gold-glow px-4 py-2 rounded transition-all duration-300 hover:shadow-[0_0_10px_rgba(245,208,96,0.3)] flex items-center space-x-1"
                            >
                              <span>View Pass</span>
                              <ArrowRight className="w-3 h-3 text-black" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="font-bebas text-3xl text-white tracking-wider uppercase border-b border-white/10 pb-2">
                Account Settings
              </h2>

              <form onSubmit={handleUpdateProfile} className="bg-dark-gray/30 border border-white/5 rounded-lg p-6 sm:p-8 space-y-6">
                
                {/* Status Message */}
                {message && (
                  <div className={`p-4 rounded border text-sm font-semibold flex items-center space-x-2 ${
                    message.type === 'success'
                      ? 'bg-green-500/5 border-green-500/30 text-green-400'
                      : 'bg-red-500/5 border-red-500/30 text-red-400'
                  }`}>
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5 col-span-1 sm:col-span-2">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                      maxLength={15}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm appearance-none font-inter"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-8 py-3 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.4)] disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{submitting ? 'Saving Changes...' : 'Save Profile Details'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-24 font-inter relative overflow-hidden flex flex-col justify-between">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-grow">
          <Suspense fallback={
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
            </div>
          }>
            <ProfileContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </>
  );
}
