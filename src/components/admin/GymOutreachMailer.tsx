'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
  Square,
  RefreshCw,
  Copy,
  ExternalLink,
  Mail,
  ShieldCheck,
  History,
  Download,
  Search,
  Check,
} from 'lucide-react';

export interface GymRecipient {
  id: string;
  no?: string | number;
  gymName: string;
  email: string;
  phone?: string;
  website?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  errorMessage?: string;
  sentAt?: string;
}

export interface SentHistoryItem {
  id: string;
  gymName: string;
  email: string;
  phone?: string;
  website?: string;
  status: 'sent' | 'failed';
  sentAt: string;
  errorMessage?: string;
  subject?: string;
}

const SAMPLE_DATA: Omit<GymRecipient, 'id' | 'status'>[] = [
  { no: 1, gymName: 'Nitrro Fitness', email: 'info@nitrro.in', phone: '91 9136696232', website: 'https://nitrro.in/' },
  { no: 2, gymName: 'True Fitness Club', email: 'support@truefitnessclub.in', phone: '91 7506528977', website: 'https://truefitnessclub.in/' },
  { no: 3, gymName: 'Anytime Fitness', email: 'prabhadevi.mumbai@anytimefitness.co.in', phone: '91 7021151199', website: 'https://www.anytimefitness.co.in/' },
  { no: 4, gymName: '3 Musketeers Fitness', email: 'contact@3musketeersfitness.com', phone: '91 9004906458', website: 'https://www.3musketeersfitness.com/' },
  { no: 5, gymName: 'The Space Fitness', email: 'studio@thespacefitness.in', phone: '91 9619348427', website: 'https://www.thespacefitness.in/' },
  { no: 6, gymName: 'R-Fitness', email: 'info@rfitness.co.in', phone: '91 9833855004', website: 'https://rfitness.co.in/' },
  { no: 7, gymName: 'Tapout Fitness', email: 'andheri@tapoutfitness.in', phone: '91 9867467495', website: 'https://www.tapoutfitness.in/' },
  { no: 8, gymName: 'Maharashtra Fitness', email: 'mahafitclub@gmail.com', phone: '91 9930923333', website: 'https://maharashtrafitness.in/' },
  { no: 9, gymName: 'Planet Muscle', email: 'planetMusclepune@gmail.com', phone: '91 9137829886', website: 'https://www.planetmuscle.fit/' },
];

export default function GymOutreachMailer() {
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'history'>('queue');

  const [recipients, setRecipients] = useState<GymRecipient[]>(() =>
    SAMPLE_DATA.map((item, idx) => ({
      ...item,
      id: `sample-${idx}`,
      status: 'pending',
    }))
  );

  // Sent History state
  const [historyLogs, setHistoryLogs] = useState<SentHistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  const [subject, setSubject] = useState(
    'Official Invitation: Will {Gym_name} compete at The Beast Hunter 2026? 🏆'
  );
  const [customNote, setCustomNote] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Campaign Sending State
  const [isSending, setIsSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [delaySeconds, setDelaySeconds] = useState(2);
  const stopRequestedRef = useRef(false);

  // Direct paste modal/drawer
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load History from localStorage & Supabase on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tbh_outreach_history');
      if (stored) {
        setHistoryLogs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading history from localStorage', e);
    }

    // Also fetch from API endpoint
    fetch('/api/admin/outreach/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
          setHistoryLogs((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newFromDb: SentHistoryItem[] = data.logs
              .filter((log: any) => !existingIds.has(log.id))
              .map((log: any) => ({
                id: log.id,
                gymName: 'Gym Recipient',
                email: log.recipient_email,
                status: log.status === 'sent' ? 'sent' : 'failed',
                sentAt: new Date(log.sent_at).toLocaleString('en-IN'),
                errorMessage: log.error_message,
              }));
            const merged = [...newFromDb, ...prev];
            return merged;
          });
        }
      })
      .catch((err) => console.warn('History API fetch warning:', err));
  }, []);

  // Save history helper
  const addHistoryItem = (item: SentHistoryItem) => {
    setHistoryLogs((prev) => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem('tbh_outreach_history', JSON.stringify(updated.slice(0, 500)));
      } catch (e) {
        console.warn('Could not save history to localStorage', e);
      }
      return updated;
    });
  };

  // Robust CSV and Excel File Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    // If file is CSV, read as text; otherwise read as binary for xlsx
    const isCsv = file.name.toLowerCase().endsWith('.csv');

    reader.onload = (evt) => {
      try {
        let rawData: any[] = [];

        if (isCsv) {
          const text = evt.target?.result as string;
          // Parse CSV with standard delimiter detection
          const wb = XLSX.read(text, { type: 'string' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        } else {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        }

        if (rawData.length < 2) {
          alert('The uploaded file appears to be empty or missing header rows.');
          return;
        }

        // Detect column indices
        const headers = rawData[0].map((h: any) => String(h || '').trim().toLowerCase());
        const gymNameIdx = headers.findIndex((h: string) => h.includes('gym') || h.includes('name'));
        const emailIdx = headers.findIndex((h: string) => h.includes('email') || h.includes('mail'));
        const phoneIdx = headers.findIndex((h: string) => h.includes('phone') || h.includes('contact') || h.includes('mobile'));
        const webIdx = headers.findIndex((h: string) => h.includes('web') || h.includes('site') || h.includes('url'));
        const noIdx = headers.findIndex((h: string) => h.includes('no') || h.includes('sr') || h === '#');

        const parsedList: GymRecipient[] = [];

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;

          const emailVal = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : '';
          const nameVal = gymNameIdx !== -1 ? String(row[gymNameIdx] || '').trim() : '';
          const phoneVal = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
          const webVal = webIdx !== -1 ? String(row[webIdx] || '').trim() : '';
          const noVal = noIdx !== -1 ? row[noIdx] : i;

          if (emailVal && emailVal.includes('@')) {
            parsedList.push({
              id: `rec-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
              no: noVal,
              gymName: nameVal || 'Gym / Fitness Center',
              email: emailVal,
              phone: phoneVal,
              website: webVal,
              status: 'pending',
            });
          }
        }

        if (parsedList.length === 0) {
          alert('Could not find any rows with valid emails. Please ensure column contains "Email".');
          return;
        }

        setRecipients(parsedList);
        setActiveSubTab('queue');
        alert(`Successfully imported ${parsedList.length} gyms from ${file.name}!`);
      } catch (err: any) {
        console.error('Error reading file:', err);
        alert('Failed to parse file: ' + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Download Sample CSV template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'No.,Gym Name,Email,Phone,Website\n' +
      '1,Nitrro Fitness,info@nitrro.in,91 9136696232,https://nitrro.in/\n' +
      '2,True Fitness Club,support@truefitnessclub.in,91 7506528977,https://truefitnessclub.in/\n' +
      '3,Anytime Fitness,prabhadevi.mumbai@anytimefitness.co.in,91 7021151199,https://www.anytimefitness.co.in/\n' +
      '4,3 Musketeers Fitness,contact@3musketeersfitness.com,91 9004906458,https://www.3musketeersfitness.com/\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_gym_outreach.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Sent History as CSV
  const handleExportHistoryCsv = () => {
    if (historyLogs.length === 0) {
      alert('No history records to export.');
      return;
    }

    let csv = 'Gym Name,Email,Status,Sent Date & Time,Error Message\n';
    historyLogs.forEach((item) => {
      csv += `"${item.gymName}","${item.email}","${item.status}","${item.sentAt}","${item.errorMessage || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `outreach_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear History
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all sent email history logs?')) return;
    setHistoryLogs([]);
    localStorage.removeItem('tbh_outreach_history');
    try {
      await fetch('/api/admin/outreach/history', { method: 'DELETE' });
    } catch (e) {
      console.warn('Could not clear remote history logs', e);
    }
  };

  // Parse pasted raw text
  const handleParsePastedText = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedList: GymRecipient[] = [];

    lines.forEach((line, idx) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      const cleanParts = parts.map((p) => p.trim());

      const email = cleanParts.find((p) => p.includes('@'));
      if (!email) return;

      const emailIndex = cleanParts.indexOf(email);
      const gymName = emailIndex > 0 ? cleanParts[emailIndex - 1] : cleanParts[0] !== email ? cleanParts[0] : 'Fitness Club';
      const phone = cleanParts.find((p) => /^\+?[0-9\s-]{8,15}$/.test(p)) || '';
      const website = cleanParts.find((p) => p.startsWith('http') || p.includes('.in') || p.includes('.com')) || '';

      parsedList.push({
        id: `paste-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        no: idx + 1,
        gymName: gymName || 'Gym / Fitness Club',
        email,
        phone,
        website,
        status: 'pending',
      });
    });

    if (parsedList.length === 0) {
      alert('Could not detect any valid email rows in pasted text.');
      return;
    }

    setRecipients(parsedList);
    setShowPasteModal(false);
    setPasteText('');
    setActiveSubTab('queue');
    alert(`Successfully parsed ${parsedList.length} gyms from pasted text!`);
  };

  // Preview Email
  const handleOpenPreview = async () => {
    setLoadingPreview(true);
    setShowPreviewModal(true);
    try {
      const sampleName = recipients[0]?.gymName || 'Nitrro Fitness';
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPreviewOnly: true,
          gymName: sampleName,
          customNote,
        }),
      });
      const data = await res.json();
      if (data.success && data.html) {
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error('Error fetching preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid email address to send test.');
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const sampleGym = recipients[0]?.gymName || 'Sample Fitness Gym';
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail.trim(),
          gymName: sampleGym,
          subject,
          customNote,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Test email successfully sent to ${testEmail}! Check your inbox.`,
        });

        // Add to history
        addHistoryItem({
          id: `test-${Date.now()}`,
          gymName: `[TEST] ${sampleGym}`,
          email: testEmail.trim(),
          status: 'sent',
          sentAt: new Date().toLocaleString('en-IN'),
          subject,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Failed to dispatch test email',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error sending test email',
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Send single email
  const handleSendSingle = async (rec: GymRecipient, index: number) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, status: 'sending', errorMessage: undefined } : r))
    );

    try {
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: rec.email,
          gymName: rec.gymName,
          subject,
          customNote,
        }),
      });

      const data = await res.json();
      const timeStr = new Date().toLocaleString('en-IN');

      if (res.ok && data.success) {
        setRecipients((prev) =>
          prev.map((r, i) => (i === index ? { ...r, status: 'sent', sentAt: timeStr } : r))
        );
        addHistoryItem({
          id: `hist-${Date.now()}-${index}`,
          gymName: rec.gymName,
          email: rec.email,
          phone: rec.phone,
          website: rec.website,
          status: 'sent',
          sentAt: timeStr,
          subject,
        });
      } else {
        const errMsg = data.error || data.message || 'Failed to send';
        setRecipients((prev) =>
          prev.map((r, i) => (i === index ? { ...r, status: 'failed', errorMessage: errMsg } : r))
        );
        addHistoryItem({
          id: `hist-${Date.now()}-${index}`,
          gymName: rec.gymName,
          email: rec.email,
          phone: rec.phone,
          website: rec.website,
          status: 'failed',
          sentAt: timeStr,
          errorMessage: errMsg,
          subject,
        });
      }
    } catch (err: any) {
      setRecipients((prev) =>
        prev.map((r, i) => (i === index ? { ...r, status: 'failed', errorMessage: err.message } : r))
      );
    }
  };

  // Start Automated Batch Campaign
  const handleStartCampaign = async () => {
    if (recipients.length === 0) {
      alert('No recipients in the list!');
      return;
    }

    const pendingCount = recipients.filter((r) => r.status === 'pending' || r.status === 'failed').length;
    if (pendingCount === 0) {
      alert('All emails have already been sent! Click "Reset Status" if you want to re-send.');
      return;
    }

    const confirmStart = window.confirm(
      `Are you ready to send automated emails to ${pendingCount} gyms with a ${delaySeconds}s delay between each email?`
    );
    if (!confirmStart) return;

    setIsSending(true);
    stopRequestedRef.current = false;

    for (let i = 0; i < recipients.length; i++) {
      if (stopRequestedRef.current) {
        break;
      }

      const rec = recipients[i];
      if (rec.status === 'sent') continue;

      setCurrentIndex(i);

      setRecipients((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: 'sending', errorMessage: undefined } : r))
      );

      try {
        const res = await fetch('/api/admin/outreach/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: rec.email,
            gymName: rec.gymName,
            subject,
            customNote,
          }),
        });

        const data = await res.json();
        const timeStr = new Date().toLocaleString('en-IN');

        if (res.ok && data.success) {
          setRecipients((prev) =>
            prev.map((r, idx) => (idx === i ? { ...r, status: 'sent', sentAt: timeStr } : r))
          );
          addHistoryItem({
            id: `hist-${Date.now()}-${i}`,
            gymName: rec.gymName,
            email: rec.email,
            phone: rec.phone,
            website: rec.website,
            status: 'sent',
            sentAt: timeStr,
            subject,
          });
        } else {
          const errMsg = data.error || data.message || 'SMTP delivery failed';
          setRecipients((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: 'failed', errorMessage: errMsg } : r
            )
          );
          addHistoryItem({
            id: `hist-${Date.now()}-${i}`,
            gymName: rec.gymName,
            email: rec.email,
            phone: rec.phone,
            website: rec.website,
            status: 'failed',
            sentAt: timeStr,
            errorMessage: errMsg,
            subject,
          });
        }
      } catch (err: any) {
        setRecipients((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: 'failed', errorMessage: err.message } : r
          )
        );
      }

      if (i < recipients.length - 1 && !stopRequestedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      }
    }

    setIsSending(false);
    setCurrentIndex(null);
  };

  const handleStopCampaign = () => {
    stopRequestedRef.current = true;
    setIsSending(false);
  };

  const handleResetStatus = () => {
    setRecipients((prev) => prev.map((r) => ({ ...r, status: 'pending', errorMessage: undefined, sentAt: undefined })));
  };

  const handleDeleteRow = (index: number) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const sentCount = recipients.filter((r) => r.status === 'sent').length;
  const failedCount = recipients.filter((r) => r.status === 'failed').length;
  const pendingCount = recipients.filter((r) => r.status === 'pending').length;

  const totalHistorySent = historyLogs.filter((h) => h.status === 'sent').length;
  const totalHistoryFailed = historyLogs.filter((h) => h.status === 'failed').length;

  const filteredHistory = historyLogs.filter((item) => {
    const q = historySearch.toLowerCase();
    return item.gymName.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 font-barlow animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-dark-gray/60 border border-white/10 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gold-premium/20 text-gold-premium border border-gold-premium/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bebas text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                Gym Outreach &amp; Automated CSV Mailer
                <span className="text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded bg-gold-premium/20 text-gold-premium border border-gold-premium/30">
                  Local Mode
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Upload your CSV/Excel file, dispatch branded HTML emails with logo &amp; track complete delivery history.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center bg-black/80 border border-white/15 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeSubTab === 'queue'
                ? 'bg-gold-premium text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Active Mailer ({recipients.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-gold-premium text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sent History ({historyLogs.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ACTIVE MAILER & QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-black/50 border border-white/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-gold-premium/15 hover:bg-gold-premium/25 text-gold-premium text-xs font-black uppercase rounded-lg border border-gold-premium/40 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload CSV / Excel Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasteModal(true)}
                className="px-4 py-2.5 bg-black/80 hover:bg-black text-white text-xs font-bold uppercase rounded-lg border border-white/20 hover:border-gold-premium transition-all flex items-center gap-2"
              >
                <Copy className="w-4 h-4 text-gold-premium" />
                <span>Paste Rows</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="px-3.5 py-2.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white text-xs font-bold uppercase rounded-lg border border-white/15 transition-all flex items-center gap-1.5"
                title="Download template with No, Gym Name, Email, Phone, Website"
              >
                <Download className="w-3.5 h-3.5 text-gray-400" />
                <span>Sample CSV</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenPreview}
              className="px-4 py-2.5 bg-black/80 hover:bg-black text-white text-xs font-bold uppercase rounded-lg border border-white/20 hover:border-gold-premium transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-gold-premium" />
              <span>Preview Branded Email</span>
            </button>
          </div>

          {/* Campaign Settings & Test Email */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject & Custom Note Controls */}
            <div className="lg:col-span-2 bg-dark-gray/60 border border-white/10 p-6 rounded-xl space-y-4">
              <h3 className="font-bebas text-xl text-white uppercase border-b border-white/10 pb-2">
                Campaign Settings
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-300 flex items-center justify-between">
                  <span>Subject Line</span>
                  <span className="text-[10px] text-gold-premium font-mono">{'{Gym_name}'} replaced dynamically</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-premium font-sans"
                  placeholder="Official Invitation: Will {Gym_name} compete at The Beast Hunter 2026? 🏆"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-gray-300">
                  Optional Custom Note / Group Discount Code
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-premium"
                  placeholder="e.g. Special Offer: 3+ athletes get 10% group discount with code GYM10"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <label className="text-xs uppercase font-bold text-gray-400">Delay between emails:</label>
                  <select
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    className="bg-black/80 border border-white/20 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold-premium"
                  >
                    <option value={1}>1 Second (Fast)</option>
                    <option value={2}>2 Seconds (Recommended)</option>
                    <option value={3}>3 Seconds (Safe)</option>
                    <option value={5}>5 Seconds (Ultra Safe)</option>
                  </select>
                </div>
                <span className="text-[11px] text-gray-500 italic">
                  *Safe delay prevents SMTP rate-limiting and spam filtering.
                </span>
              </div>
            </div>

            {/* Test Email Box */}
            <div className="bg-dark-gray/60 border border-white/10 p-6 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bebas text-xl text-gold-premium uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Send Test Email First
                </h3>
                <p className="text-xs text-gray-400 mt-2">
                  Verify how the branded HTML email looks in your actual inbox before sending to all gyms.
                </p>

                <div className="mt-4 space-y-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-premium"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTest}
                    className="w-full py-2.5 bg-black/80 hover:bg-gold-premium hover:text-black border border-gold-premium/40 text-gold-premium font-bold text-xs uppercase rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>{sendingTest ? 'Sending Test...' : 'Send Test to My Inbox'}</span>
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg text-xs font-bold border animate-in fade-in ${
                    testResult.success
                      ? 'bg-green-500/15 border-green-500/30 text-green-400'
                      : 'bg-red-500/15 border-red-500/30 text-red-400'
                  }`}
                >
                  {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Campaign Stats & Execution Bar */}
          <div className="bg-black/60 border border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-xs text-gray-400 uppercase block">Total Loaded</span>
                <span className="font-bebas text-2xl text-white">{recipients.length}</span>
              </div>
              <div className="border-l border-white/10 pl-6">
                <span className="text-xs text-green-400 uppercase block">Delivered Now</span>
                <span className="font-bebas text-2xl text-green-400">{sentCount}</span>
              </div>
              <div className="border-l border-white/10 pl-6">
                <span className="text-xs text-red-400 uppercase block">Failed</span>
                <span className="font-bebas text-2xl text-red-400">{failedCount}</span>
              </div>
              <div className="border-l border-white/10 pl-6">
                <span className="text-xs text-gray-400 uppercase block">Pending</span>
                <span className="font-bebas text-2xl text-gold-premium">{pendingCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetStatus}
                disabled={isSending}
                className="px-3.5 py-2 text-xs font-bold uppercase text-gray-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset status of all rows back to pending"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Status</span>
              </button>

              {isSending ? (
                <button
                  type="button"
                  onClick={handleStopCampaign}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-lg shadow-lg flex items-center gap-2 transition-all animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Pause / Stop Sending</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCampaign}
                  disabled={recipients.length === 0}
                  className="gold-gradient-bg text-black font-black text-xs uppercase px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Automated Campaign ({pendingCount} Pending)</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Progress Bar */}
          {isSending && (
            <div className="bg-dark-gray/90 border border-gold-premium/40 p-4 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-bold uppercase">
                <span className="text-gold-premium flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gold-premium" />
                  Sending Campaign: Processing Row {Number(currentIndex ?? 0) + 1} of {recipients.length}...
                </span>
                <span className="text-white font-mono">
                  {Math.round((sentCount / recipients.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full gold-gradient-bg transition-all duration-300"
                  style={{ width: `${(sentCount / recipients.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Current Queue Table */}
          <div className="bg-dark-gray/60 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <span className="font-bebas text-lg text-white uppercase tracking-wider flex items-center gap-2">
                Active Queue ({recipients.length} Gyms)
              </span>
              <button
                type="button"
                onClick={() => setRecipients([])}
                className="text-xs text-gray-500 hover:text-red-400 font-bold uppercase flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Table</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/90 text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-white/10">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Gym Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Website</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {recipients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        No gyms in queue. Click "Upload CSV / Excel Sheet" or "Paste Rows" above.
                      </td>
                    </tr>
                  ) : (
                    recipients.map((rec, idx) => (
                      <tr
                        key={rec.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          currentIndex === idx ? 'bg-gold-premium/10' : ''
                        }`}
                      >
                        <td className="p-3 text-center font-mono text-gray-500">{rec.no ?? idx + 1}</td>
                        <td className="p-3 font-bold text-white">{rec.gymName}</td>
                        <td className="p-3 font-mono text-gold-premium">{rec.email}</td>
                        <td className="p-3 text-gray-400 font-mono">{rec.phone || '—'}</td>
                        <td className="p-3 text-gray-400">
                          {rec.website ? (
                            <a
                              href={rec.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <span>{rec.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {rec.status === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-500/20 text-gray-400 border border-gray-500/30">
                              Pending
                            </span>
                          )}
                          {rec.status === 'sending' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Sending...
                            </span>
                          )}
                          {rec.status === 'sent' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Sent {rec.sentAt ? `(${rec.sentAt})` : ''}
                            </span>
                          )}
                          {rec.status === 'failed' && (
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center gap-1 cursor-help"
                              title={rec.errorMessage || 'Failed to send'}
                            >
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleSendSingle(rec, idx)}
                              disabled={isSending || rec.status === 'sending'}
                              className="px-2.5 py-1 rounded bg-black/60 hover:bg-gold-premium hover:text-black text-gold-premium border border-gold-premium/40 text-[10px] font-bold uppercase transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(idx)}
                              disabled={isSending}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                              title="Remove from list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* VIEW 2: SENT HISTORY & LOGS */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          {/* History Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-gray/60 border border-white/10 p-5 rounded-xl">
              <span className="text-xs text-gray-400 uppercase font-bold block">Total Emails Logged</span>
              <span className="font-bebas text-3xl text-white mt-1 block">{historyLogs.length}</span>
            </div>
            <div className="bg-dark-gray/60 border border-white/10 p-5 rounded-xl">
              <span className="text-xs text-green-400 uppercase font-bold block">Successfully Delivered</span>
              <span className="font-bebas text-3xl text-green-400 mt-1 block">{totalHistorySent}</span>
            </div>
            <div className="bg-dark-gray/60 border border-white/10 p-5 rounded-xl">
              <span className="text-xs text-red-400 uppercase font-bold block">Failed Dispatches</span>
              <span className="font-bebas text-3xl text-red-400 mt-1 block">{totalHistoryFailed}</span>
            </div>
          </div>

          {/* History Filter & Action Bar */}
          <div className="bg-black/60 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history by gym or email..."
                className="w-full bg-dark-gray/80 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-gold-premium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportHistoryCsv}
                disabled={historyLogs.length === 0}
                className="px-4 py-2 bg-gold-premium/15 hover:bg-gold-premium/25 text-gold-premium border border-gold-premium/40 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report (CSV)</span>
              </button>

              <button
                type="button"
                onClick={handleClearHistory}
                disabled={historyLogs.length === 0}
                className="px-3.5 py-2 text-xs font-bold uppercase text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-dark-gray/60 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/90 text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-white/10">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Gym Name</th>
                    <th className="p-3">Recipient Email</th>
                    <th className="p-3">Date &amp; Time Sent</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Error / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-500">
                        {historySearch ? 'No history matching search query.' : 'No sent email history recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-center font-mono text-gray-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-white">{item.gymName}</td>
                        <td className="p-3 font-mono text-gold-premium">{item.email}</td>
                        <td className="p-3 font-mono text-gray-400 text-[11px]">{item.sentAt}</td>
                        <td className="p-3 text-center">
                          {item.status === 'sent' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Delivered
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-400 text-[11px] max-w-xs truncate">
                          {item.errorMessage || (item.status === 'sent' ? 'Delivered successfully via SMTP' : '—')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Paste Data Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-gray border border-gold-premium/40 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bebas text-xl text-white uppercase flex items-center gap-2">
              <Copy className="w-5 h-5 text-gold-premium" />
              Paste Sheet Rows (CSV or Google Sheets)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Copy rows from your CSV / Google Sheets (Columns: <em>Gym Name, Email, Phone, Website</em>) and paste them directly below:
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Example format:&#10;Nitrro Fitness&#9;info@nitrro.in&#9;91 9136696232&#9;https://nitrro.in/&#10;True Fitness Club&#9;support@truefitnessclub.in&#9;91 7506528977&#9;https://truefitnessclub.in/"
              className="w-full bg-black/90 border border-white/20 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-gold-premium"
            />

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs uppercase font-bold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-6 py-2 gold-gradient-bg text-black text-xs font-black uppercase rounded-lg hover:scale-105 active:scale-95 transition-all"
              >
                Parse &amp; Import Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Email Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-dark-gray border border-gold-premium/50 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.25)] animate-in zoom-in-95">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/80">
              <div>
                <h4 className="font-bebas text-xl text-gold-premium uppercase flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Live Branded Email Preview
                </h4>
                <p className="text-[11px] text-gray-400">
                  Sample rendered for: <span className="text-white font-bold">{recipients[0]?.gymName || 'Nitrro Fitness'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold text-white uppercase"
              >
                Close Preview
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-black">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-20 text-gold-premium gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading HTML Preview...</span>
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  className="w-full h-[600px] rounded-lg border border-white/10 bg-black"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
