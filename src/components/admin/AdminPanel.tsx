'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import AdminSignIn from '@/components/admin/AdminSignIn';
import {
  ShieldCheck,
  Flame,
  IndianRupee,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  AlertCircle,
  Edit,
  LogOut,
  RefreshCw,
  Search,
  LayoutDashboard,
  UserCheck,
  Handshake,
  Menu,
} from 'lucide-react';

type Tab = 'overview' | 'events' | 'challengers' | 'sponsors';

interface DashboardStats {
  totalRevenue: number;
  totalChallengers: number;
  confirmedChallengers: number;
  pendingChallengers: number;
  totalEvents: number;
  totalUsers: number;
  activeSponsors: number;
}

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Flame },
  { id: 'challengers', label: 'Challengers', icon: UserCheck },
  { id: 'sponsors', label: 'Sponsors', icon: Handshake },
];

export default function AdminPanel({ accessDenied }: { accessDenied: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authLoadError, setAuthLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalChallengers: 0,
    confirmedChallengers: 0,
    pendingChallengers: 0,
    totalEvents: 0,
    totalUsers: 0,
    activeSponsors: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    short_description: '',
    description: '',
    ticket_price: '',
    max_participants: '',
    difficulty: 'intermediate',
    venue: '',
    event_date: '',
  });

  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any | null>(null);
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    email: '',
    logo_url: '',
    website_url: '',
    display_order: '0',
    is_active: true,
    is_popup: false,
    popup_description: '',
    popup_pages: '*',
  });

  const loadDashboard = useCallback(async () => {
    const res = await fetch('/api/admin/dashboard', {
      cache: 'no-store',
      credentials: 'include',
    });
    if (res.status === 401) {
      const err = await res.json().catch(() => ({}));
      setAuthLoadError(
        (err as { message?: string }).message ||
          'Session not recognized. Sign in again or restart the dev server after updating .env.local.'
      );
      setNeedsAuth(true);
      return false;
    }
    if (!res.ok) {
      const err = await res.json();
      setMessage({ type: 'error', text: err.message || 'Failed to load data' });
      return false;
    }
    const data = await res.json();
    setStats(data.stats);
    setEvents(data.events);
    setRegistrations(data.registrations);
    setSponsors(data.sponsors);
    setNeedsAuth(false);
    setAuthLoadError(null);
    return true;
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }
    await loadDashboard();
    setLoading(false);
  }, [loadDashboard, supabase.auth]);

  useEffect(() => {
    init();
  }, [init]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
    setMessage({ type: 'success', text: 'Dashboard refreshed' });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setNeedsAuth(true);
    setEvents([]);
    setRegistrations([]);
    setSponsors([]);
  };

  const filteredRegs = registrations.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.registration_code?.toLowerCase().includes(q) ||
      r.phone?.includes(q)
    );
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = newEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await supabase.from('events').insert({
        title: newEvent.title,
        slug,
        short_description: newEvent.short_description,
        description: newEvent.description,
        ticket_price: Number(newEvent.ticket_price),
        max_participants: Number(newEvent.max_participants),
        difficulty: newEvent.difficulty,
        venue: newEvent.venue,
        event_date: new Date(newEvent.event_date).toISOString(),
        status: 'published',
      });
      if (error) throw error;
      setShowEventModal(false);
      setNewEvent({
        title: '',
        short_description: '',
        description: '',
        ticket_price: '',
        max_participants: '',
        difficulty: 'intermediate',
        venue: '',
        event_date: '',
      });
      await loadDashboard();
      setMessage({ type: 'success', text: 'Event published' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create event' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event and all its registrations?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    await loadDashboard();
    setMessage({ type: 'success', text: 'Event deleted' });
  };

  const handleRegAction = async (id: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    const payment_status = status === 'confirmed' ? 'paid' : 'failed';
    const { error } = await supabase
      .from('registrations')
      .update({ status, payment_status })
      .eq('id', id);
    setActionLoading(null);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    await loadDashboard();
    setMessage({ type: 'success', text: `Registration ${status}` });
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newSponsor.name,
        email: newSponsor.email || null,
        logo_url: newSponsor.logo_url,
        website_url: newSponsor.website_url || null,
        display_order: Number(newSponsor.display_order) || 0,
        is_active: newSponsor.is_active,
        is_popup: newSponsor.is_popup,
        popup_description: newSponsor.is_popup ? newSponsor.popup_description : null,
        popup_pages: newSponsor.is_popup ? newSponsor.popup_pages : null,
      };
      if (newSponsor.is_popup) {
        await supabase.from('sponsors').update({ is_popup: false }).neq('id', editingSponsor?.id || '');
      }
      if (editingSponsor) {
        const { error } = await supabase.from('sponsors').update(payload).eq('id', editingSponsor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sponsors').insert(payload);
        if (error) throw error;
      }
      setShowSponsorModal(false);
      setEditingSponsor(null);
      await loadDashboard();
      setMessage({ type: 'success', text: 'Sponsor saved' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save sponsor' });
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Delete this sponsor?')) return;
    const { error } = await supabase.from('sponsors').delete().eq('id', id);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    await loadDashboard();
    setMessage({ type: 'success', text: 'Sponsor deleted' });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
        <p className="font-bebas text-xl text-white uppercase tracking-widest">Loading dashboard...</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <AdminSignIn
        serverError={authLoadError}
        onSuccess={async () => {
          setAuthLoadError(null);
          setNeedsAuth(false);
          setLoading(true);
          router.refresh();

          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setNeedsAuth(true);
            setAuthLoadError('Session was not saved. Disable browser blocking for cookies and try again.');
            setLoading(false);
            return;
          }

          let ok = await loadDashboard();
          if (!ok) {
            await new Promise((r) => setTimeout(r, 400));
            router.refresh();
            ok = await loadDashboard();
          }

          if (!ok) {
            setNeedsAuth(true);
          }
          setLoading(false);
        }}
        accessDeniedMessage={
          accessDenied ? 'This account is not on the admin whitelist or lacks admin role.' : undefined
        }
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-dark-gray/40 border border-white/10 rounded-xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 gold-gradient-bg" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-gold-premium shrink-0" />
            <div>
              <h1 className="font-bebas text-2xl sm:text-4xl text-white uppercase tracking-wide">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 font-barlow uppercase tracking-wider">
                The Beast Hunter — live data
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-white/5 border border-white/10 text-xs font-barlow font-bold uppercase text-gray-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-barlow font-bold uppercase"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile tab toggle */}
        <button
          type="button"
          className="mt-4 sm:hidden flex items-center gap-2 text-gold-premium font-barlow text-sm font-bold uppercase"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <Menu className="w-5 h-5" />
          {TABS.find((t) => t.id === activeTab)?.label}
        </button>

        {/* Tabs */}
        <nav
          className={`mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 ${
            mobileNavOpen ? 'grid' : 'hidden sm:flex'
          }`}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setMobileNavOpen(false);
              }}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-barlow font-bold uppercase tracking-wider transition-all ${
                activeTab === id
                  ? 'gold-gradient-bg text-black'
                  : 'bg-black/30 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {message && (
        <div
          className={`p-3 sm:p-4 rounded-lg border text-sm flex gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/5 border-green-500/30 text-green-400'
              : 'bg-red-500/5 border-red-500/30 text-red-400'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {message.text}
        </div>
      )}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Registered challengers', value: stats.totalChallengers, icon: UserCheck, color: 'text-gold-premium' },
              { label: 'Confirmed', value: stats.confirmedChallengers, icon: CheckCircle2, color: 'text-green-400' },
              { label: 'Revenue (paid)', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-400' },
              { label: 'Active events', value: stats.totalEvents, icon: Flame, color: 'text-orange-400' },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-dark-gray/40 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[100px]"
              >
                <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-barlow uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className="font-bebas text-2xl sm:text-3xl text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-dark-gray/30 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Pending</p>
              <p className="font-bebas text-3xl text-yellow-400">{stats.pendingChallengers}</p>
            </div>
            <div className="bg-dark-gray/30 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Platform users</p>
              <p className="font-bebas text-3xl text-blue-400">{stats.totalUsers}</p>
            </div>
            <div className="bg-dark-gray/30 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">Active sponsors</p>
              <p className="font-bebas text-3xl text-gold-premium">{stats.activeSponsors}</p>
            </div>
          </div>

          <div className="bg-dark-gray/30 border border-white/10 rounded-xl p-4 sm:p-6">
            <h2 className="font-bebas text-xl text-white uppercase mb-4">Latest registrations</h2>
            {registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">No challengers registered yet.</p>
            ) : (
              <ul className="space-y-3">
                {registrations.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">{r.full_name}</p>
                      <p className="text-xs text-gray-500">{r.email}</p>
                    </div>
                    <span className="text-xs font-barlow uppercase text-gold-premium">
                      {r.event_id?.title || 'Event'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-bebas text-2xl text-white uppercase">Events ({events.length})</h2>
            <button
              type="button"
              onClick={() => setShowEventModal(true)}
              className="gold-gradient-bg text-black font-barlow text-xs font-black uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Create event
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-dark-gray/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3"
              >
                <div>
                  <h3 className="font-bebas text-lg text-white uppercase">{ev.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ev.event_date).toLocaleDateString('en-IN')}
                    <span>· ₹{Number(ev.ticket_price).toLocaleString('en-IN')}</span>
                  </p>
                  <span className="inline-block mt-2 text-[10px] uppercase px-2 py-0.5 rounded border border-white/10 text-gray-400">
                    {ev.status}
                  </span>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Link
                    href={`/events/${ev.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs border border-white/10 rounded text-gray-300 hover:text-white text-center"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challengers */}
      {activeTab === 'challengers' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-gold-premium/10 border border-gold-premium/30 rounded-xl p-4 sm:p-6 text-center">
            <p className="font-barlow text-xs uppercase tracking-widest text-gold-premium mb-1">
              Total registered challengers
            </p>
            <p className="font-bebas text-5xl sm:text-6xl text-white">{stats.totalChallengers}</p>
            <p className="text-sm text-gray-400 mt-2">
              {stats.confirmedChallengers} confirmed · {stats.pendingChallengers} pending
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search name, email, phone, bib code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-gold-premium"
            />
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-dark-gray/30 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-black/50 text-[10px] uppercase text-gray-500 font-barlow">
                  <tr>
                    <th className="px-4 py-3">Bib</th>
                    <th className="px-4 py-3">Challenger</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegs.map((r) => (
                    <tr key={r.id} className="text-gray-300 hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-xs">{r.registration_code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{r.full_name}</div>
                        <div className="text-xs text-gray-500">{r.email} · {r.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-gold-premium text-xs uppercase">
                        {r.event_id?.title || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RegActions reg={r} loading={actionLoading} onAction={handleRegAction} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredRegs.map((r) => (
              <div key={r.id} className="bg-dark-gray/40 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{r.full_name}</p>
                    <p className="text-xs text-gray-500">{r.registration_code}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-gray-400">{r.email} · +91 {r.phone}</p>
                <p className="text-xs text-gold-premium uppercase">{r.event_id?.title}</p>
                <RegActions reg={r} loading={actionLoading} onAction={handleRegAction} />
              </div>
            ))}
          </div>

          {filteredRegs.length === 0 && (
            <p className="text-center text-gray-500 py-8">No challengers match your search.</p>
          )}
        </div>
      )}

      {/* Sponsors */}
      {activeTab === 'sponsors' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <h2 className="font-bebas text-2xl text-white uppercase">Sponsors ({sponsors.length})</h2>
            <button
              type="button"
              onClick={() => {
                setEditingSponsor(null);
                setNewSponsor({
                  name: '',
                  email: '',
                  logo_url: '',
                  website_url: '',
                  display_order: '0',
                  is_active: true,
                  is_popup: false,
                  popup_description: '',
                  popup_pages: '*',
                });
                setShowSponsorModal(true);
              }}
              className="gold-gradient-bg text-black font-barlow text-xs font-black uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add sponsor
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sp) => (
              <div
                key={sp.id}
                className="bg-dark-gray/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="h-24 relative bg-black/30 rounded-lg flex items-center justify-center overflow-hidden">
                  {sp.logo_url ? (
                    <Image src={sp.logo_url} alt={sp.name} fill className="object-contain p-2" unoptimized />
                  ) : (
                    <span className="text-xs text-gray-500">No logo</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{sp.name}</p>
                  <p className="text-xs text-gray-500">{sp.email || 'No email'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={sp.is_active ? 'active' : 'inactive'} />
                  {sp.is_popup && (
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-gold-premium/10 text-gold-premium border border-gold-premium/30">
                      Popup
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSponsor(sp);
                      setNewSponsor({
                        name: sp.name || '',
                        email: sp.email || '',
                        logo_url: sp.logo_url || '',
                        website_url: sp.website_url || '',
                        display_order: String(sp.display_order ?? 0),
                        is_active: sp.is_active ?? true,
                        is_popup: sp.is_popup ?? false,
                        popup_description: sp.popup_description || '',
                        popup_pages: sp.popup_pages || '*',
                      });
                      setShowSponsorModal(true);
                    }}
                    className="flex-1 py-2 text-xs border border-white/10 rounded text-gray-300 hover:text-white flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSponsor(sp.id)}
                    className="flex-1 py-2 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event modal */}
      {showEventModal && (
        <Modal title="Create event" onClose={() => setShowEventModal(false)}>
          <form onSubmit={handleCreateEvent} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormInput label="Title" value={newEvent.title} onChange={(v) => setNewEvent((p) => ({ ...p, title: v }))} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Ticket price (₹)" type="number" value={newEvent.ticket_price} onChange={(v) => setNewEvent((p) => ({ ...p, ticket_price: v }))} required />
              <FormInput label="Max participants" type="number" value={newEvent.max_participants} onChange={(v) => setNewEvent((p) => ({ ...p, max_participants: v }))} required />
              <FormInput label="Venue" value={newEvent.venue} onChange={(v) => setNewEvent((p) => ({ ...p, venue: v }))} required />
              <FormInput label="Event date" type="date" value={newEvent.event_date} onChange={(v) => setNewEvent((p) => ({ ...p, event_date: v }))} required />
            </div>
            <FormInput label="Short description" value={newEvent.short_description} onChange={(v) => setNewEvent((p) => ({ ...p, short_description: v }))} required />
            <label className="block space-y-1">
              <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">Full description</span>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm"
                required
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 text-xs uppercase text-gray-400">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 gold-gradient-bg text-black text-xs font-black uppercase rounded">
                Publish
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sponsor modal */}
      {showSponsorModal && (
        <Modal title={editingSponsor ? 'Edit sponsor' : 'Add sponsor'} onClose={() => { setShowSponsorModal(false); setEditingSponsor(null); }}>
          <form onSubmit={handleSaveSponsor} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormInput label="Name" value={newSponsor.name} onChange={(v) => setNewSponsor((p) => ({ ...p, name: v }))} required />
            <FormInput label="Email" type="email" value={newSponsor.email} onChange={(v) => setNewSponsor((p) => ({ ...p, email: v }))} />
            <FormInput label="Logo URL" type="url" value={newSponsor.logo_url} onChange={(v) => setNewSponsor((p) => ({ ...p, logo_url: v }))} required />
            <FormInput label="Website" type="url" value={newSponsor.website_url} onChange={(v) => setNewSponsor((p) => ({ ...p, website_url: v }))} />
            <FormInput label="Display order" type="number" value={newSponsor.display_order} onChange={(v) => setNewSponsor((p) => ({ ...p, display_order: v }))} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSponsor.is_active} onChange={(e) => setNewSponsor((p) => ({ ...p, is_active: e.target.checked }))} />
              <span className="text-sm text-gray-300">Active on website</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSponsor.is_popup} onChange={(e) => setNewSponsor((p) => ({ ...p, is_popup: e.target.checked }))} />
              <span className="text-sm text-gold-premium">Featured popup sponsor</span>
            </label>
            {newSponsor.is_popup && (
              <>
                <FormInput label="Popup pages (* for all)" value={newSponsor.popup_pages} onChange={(v) => setNewSponsor((p) => ({ ...p, popup_pages: v }))} />
                <label className="block space-y-1">
                  <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">Popup description</span>
                  <textarea
                    value={newSponsor.popup_description}
                    onChange={(e) => setNewSponsor((p) => ({ ...p, popup_description: e.target.value }))}
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm"
                  />
                </label>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setShowSponsorModal(false); setEditingSponsor(null); }} className="px-4 py-2 text-xs text-gray-400 uppercase">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 gold-gradient-bg text-black text-xs font-black uppercase rounded">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    inactive: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`text-[10px] font-barlow font-bold uppercase px-2 py-0.5 rounded border ${styles[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status}
    </span>
  );
}

function RegActions({
  reg,
  loading,
  onAction,
}: {
  reg: any;
  loading: string | null;
  onAction: (id: string, s: 'confirmed' | 'cancelled') => void;
}) {
  if (reg.status !== 'pending') return null;
  return (
    <div className="flex gap-2 justify-end">
      <button
        type="button"
        disabled={loading === reg.id}
        onClick={() => onAction(reg.id, 'confirmed')}
        className="p-2 bg-green-500/10 text-green-400 rounded"
      >
        {loading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => onAction(reg.id, 'cancelled')}
        className="p-2 bg-red-500/10 text-red-400 rounded"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#0B0B0B] border border-white/10 w-full sm:max-w-xl rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bebas text-xl text-white uppercase">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-premium"
      />
    </label>
  );
}
