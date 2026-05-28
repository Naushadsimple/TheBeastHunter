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
  Mail,
} from 'lucide-react';

type Tab = 'overview' | 'events' | 'challengers' | 'sponsors' | 'mail';

interface DashboardStats {
  totalRevenue: number;
  totalChallengers: number;
  confirmedChallengers: number;
  pendingChallengers: number;
  totalEvents: number;
  totalUsers: number;
  activeSponsors: number;
}

const PREBUILT_TEMPLATES = [
  {
    id: 'registration_confirm',
    name: 'Registration Confirmation (Pre-built)',
    subject: 'Registration Confirmed: {event}',
    body: 'Hello {name},\n\nYour registration for {event} has been successfully confirmed!\n\nYour official Bib Code is: {code}\nRegistration Status: {status}\n\nWe look forward to seeing you at the starting line. Stay strong and keep training!\n\nBest regards,\nThe Beast Hunter Challenge Team',
  },
  {
    id: 'payment_receipt',
    name: 'Payment Receipt (Pre-built)',
    subject: 'Receipt for your payment: {event}',
    body: 'Hello {name},\n\nWe have successfully received your payment of {price} for {event}.\n\nRegistration Status: {status}\nBib Code: {code}\n\nYour ticket has been officially generated. Get ready to unleash the beast!\n\nBest regards,\nThe Beast Hunter Challenge Team',
  },
  {
    id: 'event_reminder',
    name: 'Event Day Reminder (Pre-built)',
    subject: 'Important Reminder: {event} is coming up!',
    body: 'Hello {name},\n\nThis is a friendly reminder that {event} is just around the corner!\n\nDetails:\n- Event: {event}\n- Bib Code: {code}\n- Ticket Price: {price}\n- Status: {status}\n\nPlease ensure you arrive at the venue early and carry your ID proof.\n\nKeep pushing, keep hunting!\n\nBest regards,\nThe Beast Hunter Challenge Team',
  },
];

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: Flame },
  { id: 'challengers', label: 'Challengers', icon: UserCheck },
  { id: 'sponsors', label: 'Sponsors', icon: Handshake },
  { id: 'mail', label: 'Mail Center', icon: Mail },
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
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [viewingReg, setViewingReg] = useState<any | null>(null);

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

  // Mail Center states
  const [recipientType, setRecipientType] = useState<'single' | 'all' | 'event'>('single');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tbh_custom_templates');
      if (stored) {
        try {
          setCustomTemplates(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored templates', e);
        }
      }
    }
  }, []);

  const saveCustomTemplate = (templatesList: any[]) => {
    setCustomTemplates(templatesList);
    localStorage.setItem('tbh_custom_templates', JSON.stringify(templatesList));
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setEmailSubject('');
      setEmailBody('');
      return;
    }

    const prebuilt = PREBUILT_TEMPLATES.find((t) => t.id === templateId);
    if (prebuilt) {
      setEmailSubject(prebuilt.subject);
      setEmailBody(prebuilt.body);
      return;
    }

    const custom = customTemplates.find((t) => t.id === templateId);
    if (custom) {
      setEmailSubject(custom.subject);
      setEmailBody(custom.body);
    }
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      setMessage({ type: 'error', text: 'All template fields are required' });
      return;
    }
    const created = {
      id: `custom_${Date.now()}`,
      name: `${newTemplate.name} (Custom)`,
      subject: newTemplate.subject,
      body: newTemplate.body,
    };
    const updated = [...customTemplates, created];
    saveCustomTemplate(updated);
    setShowTemplateModal(false);
    setNewTemplate({ name: '', subject: '', body: '' });
    setMessage({ type: 'success', text: 'Custom template saved!' });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Are you sure you want to delete this custom template?')) return;
    const updated = customTemplates.filter((t) => t.id !== templateId);
    saveCustomTemplate(updated);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId('');
      setEmailSubject('');
      setEmailBody('');
    }
    setMessage({ type: 'success', text: 'Template deleted' });
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientType === 'single' && !selectedRecipientId) {
      setMessage({ type: 'error', text: 'Please select a challenger' });
      return;
    }
    if (recipientType === 'event' && !selectedEventId) {
      setMessage({ type: 'error', text: 'Please select an event cohort' });
      return;
    }
    if (!emailSubject || !emailBody) {
      setMessage({ type: 'error', text: 'Subject and Body cannot be empty' });
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          recipientId: recipientType === 'single' ? selectedRecipientId : undefined,
          eventId: recipientType === 'event' ? selectedEventId : undefined,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to dispatch emails');

      setMessage({
        type: 'success',
        text: `Success! ${data.message || `Processed emails for ${data.count} recipients.`}`,
      });
      
      // Reset composer
      setEmailSubject('');
      setEmailBody('');
      setSelectedTemplateId('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send emails' });
    } finally {
      setSendingEmail(false);
    }
  };

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

  const handleRegAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');

      setMessage({ type: 'success', text: data.message });
      await loadDashboard();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update registration' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProof = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('id-proofs')
        .createSignedUrl(path, 600);
      if (error || !data?.signedUrl) {
        throw new Error(error?.message || 'Failed to generate secure URL');
      }
      setViewingProofUrl(data.signedUrl);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Could not load proof' });
    }
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
                The Beast Hunter Challenge — live data
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
                    <th className="px-4 py-3">Txn ID / UTR</th>
                    <th className="px-4 py-3">Payment Proof</th>
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
                      <td className="px-4 py-3 text-gold-premium text-xs uppercase font-semibold">
                        {r.event_id?.title || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {r.transaction_id || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.payment_proof_url ? (
                          <button
                            type="button"
                            onClick={() => handleViewProof(r.payment_proof_url)}
                            className="text-gold-premium hover:underline text-xs font-bold uppercase transition-all"
                          >
                            View Proof
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingReg(r)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-barlow text-xs font-bold uppercase rounded transition-all"
                          >
                            Details
                          </button>
                          <RegActions reg={r} loading={actionLoading} onAction={handleRegAction} />
                        </div>
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
                <p className="text-xs text-gold-premium uppercase font-semibold">{r.event_id?.title}</p>
                {r.transaction_id && (
                  <p className="text-xs text-gray-300">
                    <span className="text-gray-500">UTR:</span> <span className="font-mono">{r.transaction_id}</span>
                  </p>
                )}
                {r.payment_proof_url && (
                  <button
                    type="button"
                    onClick={() => handleViewProof(r.payment_proof_url)}
                    className="text-gold-premium hover:underline text-xs font-bold uppercase block text-left mt-1"
                  >
                    View Payment Proof
                  </button>
                )}
                <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setViewingReg(r)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-barlow text-xs font-bold uppercase rounded transition-all"
                  >
                    View Details
                  </button>
                  <RegActions reg={r} loading={actionLoading} onAction={handleRegAction} />
                </div>
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

      {/* Mail Center */}
      {activeTab === 'mail' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bebas text-2xl text-white uppercase flex items-center gap-2">
                <Mail className="w-6 h-6 text-gold-premium" />
                Mail Center &amp; Broadcast
              </h2>
              <p className="text-xs text-gray-500 font-barlow uppercase tracking-wider mt-1">
                Compose custom alerts or load pre-built event emails to challengers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="gold-gradient-bg text-black font-barlow text-xs font-black uppercase px-4 py-2.5 rounded flex items-center justify-center gap-1 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Custom Template
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle Column: Email Composer */}
            <div className="lg:col-span-2 bg-dark-gray/40 border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
              <h3 className="font-bebas text-lg text-white uppercase border-b border-white/5 pb-2">
                Email Composer
              </h3>
              
              <form onSubmit={handleSendEmail} className="space-y-4">
                {/* Recipient Selector type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'single', label: 'Single Challenger' },
                    { id: 'event', label: 'Event Broadcast' },
                    { id: 'all', label: 'Broadcast All Users' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-barlow font-bold uppercase tracking-wider cursor-pointer transition-all ${
                        recipientType === opt.id
                          ? 'border-gold-premium/50 bg-gold-premium/5 text-gold-premium'
                          : 'border-white/10 bg-black/20 text-gray-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recipientType"
                        checked={recipientType === opt.id}
                        onChange={() => {
                          setRecipientType(opt.id as any);
                          setSelectedRecipientId('');
                          setSelectedEventId('');
                        }}
                        className="accent-gold-premium"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                {/* Conditional selector drop downs */}
                {recipientType === 'single' && (
                  <label className="block space-y-1">
                    <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                      Select Challenger
                    </span>
                    <select
                      value={selectedRecipientId}
                      onChange={(e) => setSelectedRecipientId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-premium"
                      required
                    >
                      <option value="">-- Choose registered challenger --</option>
                      {registrations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.full_name} ({r.email}) - {r.event_id?.title || 'Unknown Event'} [Status: {r.status}]
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {recipientType === 'event' && (
                  <label className="block space-y-1">
                    <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                      Select Event Cohort
                    </span>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-premium"
                      required
                    >
                      <option value="">-- Choose event --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} ({new Date(ev.event_date).toLocaleDateString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Select template dropdown */}
                <label className="block space-y-1">
                  <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                    Load Email Template
                  </span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-premium"
                  >
                    <option value="">-- Composed from scratch --</option>
                    <optgroup label="Pre-built Templates">
                      {PREBUILT_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </optgroup>
                    {customTemplates.length > 0 && (
                      <optgroup label="Custom Templates">
                        {customTemplates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>

                {/* Subject field */}
                <label className="block space-y-1">
                  <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                    Subject Line
                  </span>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold-premium"
                    required
                  />
                </label>

                {/* Body field */}
                <label className="block space-y-1">
                  <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                    Email Message Body
                  </span>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type your email message..."
                    rows={12}
                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-3 text-white text-sm font-mono focus:outline-none focus:border-gold-premium leading-relaxed"
                    required
                  />
                </label>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="w-full sm:w-auto px-8 py-4 bg-gold-premium text-black font-barlow text-base font-black uppercase tracking-wider rounded hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>Dispatch Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Placeholders info & custom templates manager */}
            <div className="space-y-6">
              {/* Placeholders info */}
              <div className="bg-gold-premium/5 border border-gold-premium/20 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 gold-gradient-bg" />
                <h4 className="font-bebas text-base text-gold-premium uppercase tracking-wider mb-3">
                  Dynamic Placeholders
                </h4>
                <p className="text-xs text-gray-400 mb-4 font-inter leading-relaxed">
                  Use these tags in your template Subject or Body. They will be automatically replaced with the challenger's real details during sending:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-gold-glow block font-bold">{`{name}`}</span>
                    <span className="text-[10px] text-gray-500">Challenger name</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-gold-glow block font-bold">{`{event}`}</span>
                    <span className="text-[10px] text-gray-500">Event title</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-gold-glow block font-bold">{`{code}`}</span>
                    <span className="text-[10px] text-gray-500">Bib / Reg code</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5">
                    <span className="text-gold-glow block font-bold">{`{price}`}</span>
                    <span className="text-[10px] text-gray-500">Ticket price</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-white/5 col-span-2">
                    <span className="text-gold-glow block font-bold">{`{status}`}</span>
                    <span className="text-[10px] text-gray-500">Registration status</span>
                  </div>
                </div>
              </div>

              {/* Custom templates list */}
              <div className="bg-dark-gray/30 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
                <h4 className="font-bebas text-lg text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  My Custom Templates
                </h4>
                {customTemplates.length === 0 ? (
                  <p className="text-xs text-gray-500 font-inter italic leading-relaxed">
                    No custom templates created yet. Click "Create Custom Template" to build one!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {customTemplates.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 p-3 rounded bg-black/20 border border-white/5 hover:border-white/10"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-white truncate">{t.name.replace(' (Custom)', '')}</p>
                          <p className="text-[10px] text-gray-500 truncate mt-0.5">{t.subject}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(t.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Modal */}
      {showTemplateModal && (
        <Modal title="Create Custom Template" onClose={() => setShowTemplateModal(false)}>
          <form onSubmit={handleCreateTemplate} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <FormInput
              label="Template Name"
              value={newTemplate.name}
              onChange={(v) => setNewTemplate((p) => ({ ...p, name: v }))}
              required
            />
            <FormInput
              label="Subject line"
              value={newTemplate.subject}
              onChange={(v) => setNewTemplate((p) => ({ ...p, subject: v }))}
              required
            />
            <label className="block space-y-1">
              <span className="text-[10px] font-barlow font-bold text-gray-500 uppercase">
                Email Message Body
              </span>
              <textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate((p) => ({ ...p, body: e.target.value }))}
                rows={8}
                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm font-mono leading-relaxed"
                placeholder="Hi {name},..."
                required
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-xs uppercase text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 gold-gradient-bg text-black text-xs font-black uppercase rounded"
              >
                Save Template
              </button>
            </div>
          </form>
        </Modal>
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
          <form onSubmit={handleSaveSponsor} className="flex flex-col max-h-[75vh]">
            <div className="space-y-4 overflow-y-auto p-1 flex-grow pr-2 max-h-[50vh]">
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
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10 shrink-0">
              <button type="button" onClick={() => { setShowSponsorModal(false); setEditingSponsor(null); }} className="px-4 py-2 text-xs text-gray-400 uppercase hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 gold-gradient-bg text-black text-xs font-black uppercase rounded hover:scale-105 active:scale-95 transition-all">
                Save Sponsor
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Proof viewing modal */}
      {viewingProofUrl && (
        <Modal title="Payment Proof Screenshot" onClose={() => setViewingProofUrl(null)}>
          <div className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-lg">
            <div className="relative w-full h-[60vh] max-h-[500px] flex items-center justify-center overflow-hidden rounded bg-black/20">
              <img
                src={viewingProofUrl}
                alt="Payment proof screenshot"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="w-full flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="px-6 py-2 bg-gold-premium text-black text-xs font-black uppercase rounded hover:scale-105 active:scale-95 transition-all font-barlow"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Challenger details modal */}
      {viewingReg && (() => {
        const orderId = viewingReg.payments?.[0]?.cashfree_order_id || '—';
        const orderLink = orderId !== '—'
          ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/payment/success?order_id=${orderId}`
          : null;

        return (
          <Modal title="Challenger Details" onClose={() => setViewingReg(null)}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Bib / Reg Code</span>
                  <span className="text-white font-mono text-sm font-semibold">{viewingReg.registration_code || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Status</span>
                  <div className="mt-1">
                    <StatusBadge status={viewingReg.status} />
                  </div>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg sm:col-span-2">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Event</span>
                  <span className="text-gold-premium text-sm font-semibold uppercase">{viewingReg.event_id?.title || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Full Name</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.full_name || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Email</span>
                  <span className="text-white text-sm font-semibold break-all">{viewingReg.email || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Phone</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.phone ? `+91 ${viewingReg.phone}` : '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Instagram ID</span>
                  {viewingReg.insta_id ? (
                    <a
                      href={`https://instagram.com/${viewingReg.insta_id.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-premium hover:underline text-sm font-semibold block"
                    >
                      {viewingReg.insta_id}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm font-semibold">—</span>
                  )}
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Age</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.age ?? '—'} years</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Gender</span>
                  <span className="text-white text-sm font-semibold capitalize">{viewingReg.gender || 'male'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">City</span>
                  <span className="text-white text-sm font-semibold capitalize">{viewingReg.city || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">T-Shirt Size</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.tshirt_size || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Medical Conditions / Blood Group</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.medical_conditions || 'None'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Emergency Contact</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.emergency_contact || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Emergency Phone</span>
                  <span className="text-white text-sm font-semibold">{viewingReg.emergency_phone ? `+91 ${viewingReg.emergency_phone}` : '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Transaction / UTR ID</span>
                  <span className="text-white font-mono text-sm font-semibold">{viewingReg.transaction_id || '—'}</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Payment Proof</span>
                  {viewingReg.payment_proof_url ? (
                    <button
                      type="button"
                      onClick={() => handleViewProof(viewingReg.payment_proof_url)}
                      className="text-gold-premium hover:underline text-sm font-semibold block text-left"
                    >
                      View Screenshot Proof
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </div>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg sm:col-span-2">
                  <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Order ID</span>
                  <span className="text-white font-mono text-sm font-semibold">{orderId}</span>
                </div>
                {orderLink && (
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg sm:col-span-2">
                    <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-bold">Success Order Link</span>
                    <a
                      href={orderLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-premium hover:underline text-xs font-mono break-all font-semibold block mt-1"
                    >
                      {orderLink}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10 mt-6">
                <div>
                  {viewingReg.status === 'pending' && (
                    <RegActions
                      reg={viewingReg}
                      loading={actionLoading}
                      onAction={(id, action) => {
                        handleRegAction(id, action);
                        setViewingReg(null);
                      }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReg(null)}
                  className="w-full sm:w-auto px-6 py-2 bg-gold-premium text-black text-xs font-black uppercase rounded hover:scale-105 active:scale-95 transition-all font-barlow self-end"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
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
  onAction: (id: string, action: 'approve' | 'reject') => void;
}) {
  if (reg.status !== 'pending') return null;
  return (
    <div className="flex gap-2 justify-end">
      <button
        type="button"
        disabled={loading === reg.id}
        onClick={() => onAction(reg.id, 'approve')}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-barlow text-xs font-bold uppercase rounded flex items-center gap-1 transition-all"
        title="Approve Challenger"
      >
        {loading === reg.id ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5" />
        )}
        <span>Approve</span>
      </button>
      <button
        type="button"
        disabled={loading === reg.id}
        onClick={() => onAction(reg.id, 'reject')}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-barlow text-xs font-bold uppercase rounded flex items-center gap-1 transition-all"
        title="Reject Challenger"
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>Reject</span>
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
