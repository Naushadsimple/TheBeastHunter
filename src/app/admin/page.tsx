'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ShieldCheck, 
  Users, 
  Flame, 
  IndianRupee, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  BarChart3,
  Calendar,
  AlertCircle,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function AdminContent() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    totalRegs: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    ticket_price: '',
    max_participants: '',
    difficulty: 'intermediate',
    venue: '',
    event_date: '',
  });

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login?return_to=/admin');
          return;
        }

        // Verify role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          router.push('/'); // Redirect non-admins to home
          return;
        }

        setIsAdmin(true);
        await Promise.all([fetchStats(), fetchEvents(), fetchRegistrations()]);
      } catch (err) {
        console.error('Admin verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Events count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      // Registrations count & Revenue
      const { data: regs } = await supabase
        .from('registrations')
        .select('amount_paid, status, meta');

      const confirmedRegs = regs?.filter(r => r.status === 'confirmed') || [];
      const totalRev = confirmedRegs.reduce((sum, r) => {
        // Fallback to amount_paid or meta amount
        return sum + (Number(r.amount_paid) || Number(r.meta?.basePrice) + Number(r.meta?.gstAmount) || 0);
      }, 0);

      setStats({
        totalUsers: usersCount || 0,
        totalEvents: eventsCount || 0,
        totalRevenue: totalRev,
        totalRegs: regs?.length || 0,
      });
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  const fetchRegistrations = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('*, event_id(*)')
      .order('created_at', { ascending: false });
    if (data) setRegistrations(data);
  };

  const handleAction = async (id: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    setMessage(null);
    try {
      const paymentStatus = status === 'confirmed' ? 'paid' : 'failed';
      const { error } = await supabase
        .from('registrations')
        .update({ status, payment_status: paymentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, status, payment_status: paymentStatus } : r)
      );

      // Refresh Stats
      await fetchStats();

      setMessage({ type: 'success', text: `Registration status updated to ${status}!` });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will delete all registrations!')) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      setEvents(prev => prev.filter(e => e.id !== id));
      await fetchStats();
      setMessage({ type: 'success', text: 'Event deleted successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete event.' });
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const slugVal = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await supabase.from('events').insert({
        title: newEvent.title,
        slug: slugVal,
        short_description: newEvent.short_description,
        description: newEvent.description,
        ticket_price: Number(newEvent.ticket_price),
        max_participants: Number(newEvent.max_participants),
        difficulty: newEvent.difficulty,
        venue: newEvent.venue,
        event_date: new Date(newEvent.event_date).toISOString(),
        status: 'published', // Publish immediately for easy dev
      });

      if (error) throw error;

      setShowEventModal(false);
      setNewEvent({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        ticket_price: '',
        max_participants: '',
        difficulty: 'intermediate',
        venue: '',
        event_date: '',
      });

      await fetchEvents();
      await fetchStats();
      setMessage({ type: 'success', text: 'Event created successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create event.' });
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Bib Code', 'Name', 'Email', 'Phone', 'Event', 'T-Shirt', 'Status', 'Paid Amount'];
      const rows = registrations.map(r => [
        r.registration_code,
        r.full_name,
        r.email,
        r.phone,
        r.event_id?.title || 'Unknown',
        r.tshirt_size,
        r.status,
        r.amount_paid || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `TBH-Registrations-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
        <h2 className="font-bebas text-2xl tracking-widest text-white uppercase animate-pulse">Entering Command Center</h2>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 font-inter relative z-10">
      
      {/* Admin Header banner */}
      <div className="bg-dark-gray/30 border border-white/5 backdrop-blur-md rounded-lg p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-gold-premium" />
          <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase">Admin Control Panel</h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-white/5 border border-white/10 hover:border-gold-premium/30 hover:bg-gold-premium/5 text-gray-300 hover:text-gold-premium font-barlow text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-all duration-300 flex items-center space-x-1.5 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Message Notifications */}
      {message && (
        <div className={`p-4 rounded border text-sm font-semibold flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-500/5 border-green-500/30 text-green-400'
            : 'bg-red-500/5 border-red-500/30 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-400' },
          { label: 'Total Athletes', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
          { label: 'Total Registrations', value: stats.totalRegs, icon: BarChart3, color: 'text-purple-400' },
          { label: 'Active Events', value: stats.totalEvents, icon: Flame, color: 'text-gold-premium' }
        ].map((item, idx) => (
          <div key={idx} className="bg-dark-gray/30 border border-white/5 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{item.label}</span>
              <span className="font-bebas text-3xl text-white tracking-wide block">{item.value}</span>
            </div>
            <item.icon className={`w-8 h-8 ${item.color} opacity-80`} />
          </div>
        ))}
      </div>

      {/* Bottom Main Content split: Events List & Registrations List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Side: Events List (1 Column) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="font-bebas text-2xl text-white tracking-wider uppercase">Event Inventory</h2>
            <button
              onClick={() => setShowEventModal(true)}
              className="gold-gradient-bg text-black font-barlow text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-gray-500 text-sm italic font-inter text-center py-6">No events created yet.</p>
            ) : (
              events.map(ev => (
                <div key={ev.id} className="bg-dark-gray/30 border border-white/5 rounded p-4 flex items-center justify-between group hover:border-gold-premium/30 transition-colors duration-300">
                  <div className="space-y-1">
                    <h3 className="font-bebas text-lg text-white uppercase tracking-wider">{ev.title}</h3>
                    <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-barlow uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gold-premium" />
                        <span>{new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </span>
                      <span>₹{Number(ev.ticket_price)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded transition-colors duration-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Registrations List (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          <h2 className="font-bebas text-2xl text-white tracking-wider uppercase border-b border-white/10 pb-2">
            Runner Registrations
          </h2>

          <div className="bg-dark-gray/30 border border-white/5 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-black/40 border-b border-white/5 text-[10px] text-gray-500 font-barlow font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-4">Bib Code</th>
                    <th className="px-5 py-4">Runner Name</th>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-500 italic">
                        No registrations received yet.
                      </td>
                    </tr>
                  ) : (
                    registrations.map(reg => (
                      <tr key={reg.id} className="hover:bg-white/2 transition-colors duration-200">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-400">
                          {reg.registration_code}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{reg.full_name}</div>
                          <div className="text-[10px] text-gray-500">{reg.email} | +91 {reg.phone}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bebas text-xs tracking-wider uppercase text-gold-premium block">
                            {reg.event_id?.title || 'Unknown Event'}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                            T-Shirt: {reg.tshirt_size}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block text-[9px] font-barlow font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            reg.status === 'confirmed'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : reg.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {reg.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAction(reg.id, 'confirmed')}
                                  disabled={actionLoading === reg.id}
                                  className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors duration-200 cursor-pointer"
                                  title="Confirm Ticket"
                                >
                                  {actionLoading === reg.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAction(reg.id, 'cancelled')}
                                  disabled={actionLoading === reg.id}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors duration-200 cursor-pointer"
                                  title="Reject Ticket"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {reg.id_proof_url && (
                              <a
                                href={reg.id_proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors duration-200"
                                title="View ID Proof"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* CREATE EVENT MODAL DRAWER OVERLAY */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/10 w-full max-w-xl rounded-lg overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg animate-pulse" />
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">Create New Challenge</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[500px] overflow-y-auto font-inter text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Beast Mud Run 2026"
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difficulty</label>
                  <select
                    value={newEvent.difficulty}
                    onChange={e => setNewEvent(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs font-barlow uppercase tracking-wider"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ticket Price (₹)</label>
                  <input
                    type="number"
                    value={newEvent.ticket_price}
                    onChange={e => setNewEvent(prev => ({ ...prev, ticket_price: e.target.value }))}
                    placeholder="1500"
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Max Participants</label>
                  <input
                    type="number"
                    value={newEvent.max_participants}
                    onChange={e => setNewEvent(prev => ({ ...prev, max_participants: e.target.value }))}
                    placeholder="500"
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Venue</label>
                  <input
                    type="text"
                    value={newEvent.venue}
                    onChange={e => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                    placeholder="Bengaluru Arena"
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Event Date</label>
                  <input
                    type="date"
                    value={newEvent.event_date}
                    onChange={e => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                    className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs appearance-none font-inter"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Short Description</label>
                <input
                  type="text"
                  value={newEvent.short_description}
                  onChange={e => setNewEvent(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="India's toughest mud obstacle run..."
                  className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter full details about obstacles, routes, etc..."
                  rows={4}
                  className="bg-black/40 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-gold-premium w-full text-xs font-inter"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-barlow text-xs font-bold uppercase tracking-wider rounded transition-colors duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 gold-gradient-bg text-black font-barlow text-xs font-black uppercase tracking-wider rounded transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(245,208,96,0.4)]"
                >
                  Publish Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminPage() {
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
            <AdminContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </>
  );
}
