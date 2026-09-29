import React, { useState, useEffect, useRef } from 'react';
import { useElection } from '../../context/ElectionContext';
import { SUPABASE_SETUP_SQL, SUPABASE_URL } from '../../lib/supabase';
import { DEFAULT_OSIS_EMBLEM } from '../../lib/sampleData';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Power, 
  Eye, 
  EyeOff, 
  Key, 
  RotateCcw, 
  Database, 
  Copy, 
  Check, 
  Calendar,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  School,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

// Preset Logo Pilihan Sekolah
const PRESET_LOGOS = [
  {
    id: 'osis-resmi',
    name: 'Logo Resmi OSIS',
    description: 'Emblem standar OSIS nasional',
    url: DEFAULT_OSIS_EMBLEM,
    badge: 'Rekomendasi'
  },
  {
    id: 'pendidikan-tutwuri',
    name: 'Lambang Obor Pendidikan',
    description: 'Simbol api obor & buku ilmu pengetahuan',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(%23g1)" stroke="%2393c5fd" stroke-width="3"/><path d="M50 18 L55 35 L72 38 L59 50 L63 67 L50 58 L37 67 L41 50 L28 38 L45 35 Z" fill="%23fbbf24" stroke="%23f59e0b" stroke-width="1.5"/><path d="M26 76 Q50 68 74 76 Q50 84 26 76 Z" fill="%23ffffff"/><circle cx="50" cy="50" r="12" fill="%23ef4444"/><path d="M50 38 Q56 46 50 54 Q44 46 50 38 Z" fill="%23fef08a"/></svg>',
    badge: 'Edukasi'
  },
  {
    id: 'perisai-prestasi',
    name: 'Perisai Garuda & Bintang',
    description: 'Desain perisai akademi modern emas biru',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><path d="M50 10 L82 22 C82 58 66 80 50 90 C34 80 18 58 18 22 Z" fill="url(%23shieldG)" stroke="%23fbbf24" stroke-width="3"/><polygon points="50,26 56,38 70,40 59,51 62,64 50,57 38,64 41,51 30,40 44,38" fill="%23fbbf24"/><path d="M28 70 Q50 60 72 70" stroke="%2360a5fa" stroke-width="2" fill="none"/></svg>',
    badge: 'Prestasi'
  },
  {
    id: 'teknologi-inovasi',
    name: 'Crest Cerdas Modern',
    description: 'Logo modern futuristik biru cyan',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="techG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><rect x="12" y="12" width="76" height="76" rx="22" fill="url(%23techG)" stroke="%2338bdf8" stroke-width="2.5"/><circle cx="50" cy="50" r="22" fill="%230f172a" stroke="%2338bdf8" stroke-width="2"/><path d="M40 50 L47 57 L62 42" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    badge: 'Modern'
  }
];

export const ElectionSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllVotes,
    supabaseConnected,
    syncWithSupabase,
    lastSyncedAt,
    totalVotes,
    votedCount,
    totalVoters
  } = useElection();

  const [form, setForm] = useState({
    schoolName: settings.schoolName,
    schoolLogoUrl: settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM,
    electionYear: settings.electionYear,
    startDate: settings.startDate,
    endDate: settings.endDate,
    votingStatus: settings.votingStatus,
    publicResultStatus: settings.publicResultStatus,
    adminPin: settings.adminPin,
  });

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSqlCopied, setShowSqlCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form when global settings change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      schoolName: settings.schoolName,
      schoolLogoUrl: settings.schoolLogoUrl || DEFAULT_OSIS_EMBLEM,
      electionYear: settings.electionYear,
      startDate: settings.startDate,
      endDate: settings.endDate,
      votingStatus: settings.votingStatus,
      publicResultStatus: settings.publicResultStatus,
      adminPin: settings.adminPin,
    }));
  }, [settings]);

  // Handle Logo File Upload (PNG, JPG, SVG, WebP)
  const handleFileProcess = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (PNG, JPG, JPEG, SVG, atau WebP).');
      return;
    }

    // Max 4MB size
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 4MB agar aplikasi tetap cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setForm(prev => ({ ...prev, schoolLogoUrl: e.target!.result as string }));
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar. Silakan coba kembali.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setForm(prev => ({ ...prev, schoolLogoUrl: customUrlInput.trim() }));
      setCustomUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleResetToDefaultLogo = () => {
    setForm(prev => ({ ...prev, schoolLogoUrl: DEFAULT_OSIS_EMBLEM }));
    setUploadError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    await updateSettings(form);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setShowSqlCopied(true);
    setTimeout(() => setShowSqlCopied(false), 2500);
  };

  const handleExecuteResetAll = async () => {
    setIsResetting(true);
    try {
      const res = await resetAllVotes();
      setIsResetting(false);
      setShowResetConfirm(false);
      if (res?.success) {
        setResetSuccessMessage(res.message);
        setTimeout(() => setResetSuccessMessage(null), 6000);
      }
    } catch (err: any) {
      setIsResetting(false);
      setShowResetConfirm(false);
      setUploadError('Gagal mereset data suara: ' + (err?.message || 'Terjadi kesalahan sistem'));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Pengaturan Sistem Pemilihan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi nama sekolah, ganti logo sekolah, status pemilihan, jadwal, dan integrasi database.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan Berhasil Disimpan & Diterapkan!</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: NAMA SEKOLAH & LOGO RESMI */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <School className="w-5 h-5 text-blue-400" />
                <span>Identitas Nama & Logo Sekolah</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Perubahan nama dan logo sekolah akan otomatis diperbarui di Navbar, Beranda, Bilik Suara, dan Real Count.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[11px] font-semibold">
              Live Real-Time Sync
            </span>
          </div>

          {/* EDIT NAMA SEKOLAH */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Nama Sekolah
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                placeholder="Contoh: SMA NEGERI 1 TELADAN atau SMK NEGERI 2 BANDUNG"
                className="w-full px-4 py-3 pl-11 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
              <School className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span>Ditampilkan sebagai identitas resmi instansi pada seluruh halaman pemilih dan bukti surat suara.</span>
            </p>
          </div>

          {/* GANTI LOGO SEKOLAH */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Logo Sekolah / Lambang OSIS
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Kembalikan ke lambang OSIS bawaan"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Logo Bawaan</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Logo Management Grid: Preview + Upload + Presets */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Box 1: Visual Live Preview */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Pratinjau Logo Aktif
                </p>

                {/* Logo Frame */}
                <div className="relative w-28 h-28 rounded-2xl bg-slate-950 border-2 border-blue-500/40 p-2 shadow-xl shadow-blue-950/40 flex items-center justify-center overflow-hidden group">
                  <img
                    src={form.schoolLogoUrl || DEFAULT_OSIS_EMBLEM}
                    alt="Logo Sekolah Pratinjau"
                    className="w-full h-full object-contain drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                    }}
                  />
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                </div>

                <div className="mt-3.5 space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Logo Terpilih
                  </span>
                  <p className="text-xs font-bold text-white truncate max-w-[200px] mt-1">
                    {form.schoolName || 'Nama Sekolah'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Otomatis disinkronkan ke seluruh aplikasi
                  </p>
                </div>

                {/* Navbar Mini Mockup Preview */}
                <div className="w-full mt-4 pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold mb-2">
                    Tampilan di Navbar:
                  </p>
                  <div className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-left">
                    <img
                      src={form.schoolLogoUrl || DEFAULT_OSIS_EMBLEM}
                      alt="Mini Logo"
                      className="w-6 h-6 rounded-md object-contain shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-[10px] font-extrabold text-white leading-tight">OSIS VOTE</p>
                      <p className="text-[9px] text-slate-400 truncate leading-tight">{form.schoolName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Upload Action & Presets */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* 1. Drag & Drop Upload Zone */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-blue-400 bg-blue-950/40 scale-[1.01]'
                        : 'border-slate-700 hover:border-blue-500/70 hover:bg-slate-900/60 bg-slate-900/30'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Klik untuk Unggah Foto / Logo Sekolah Baru
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      atau seret (drag & drop) file logo ke area ini
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-500 font-medium">
                      <span>Format: PNG, JPG, JPEG, SVG, WebP</span>
                      <span>•</span>
                      <span>Maks. 4MB</span>
                      <span>•</span>
                      <span>Disarankan Transparan / Persegi</span>
                    </div>
                  </div>
                </div>

                {/* 2. Preset Logos (Pilihan Cepat) */}
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilihan Logo Sekolah & OSIS Cepat (1-Klik):</span>
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PRESET_LOGOS.map((preset) => {
                      const isActive = form.schoolLogoUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, schoolLogoUrl: preset.url }));
                            setUploadError(null);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center text-center cursor-pointer group ${
                            isActive
                              ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/30 shadow-md shadow-blue-500/20'
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-950 p-1.5 border border-slate-800 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-white leading-tight line-clamp-1">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-blue-400 font-semibold mt-0.5">
                            {preset.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Masukkan URL Logo (Opsional) */}
                <div className="pt-2">
                  {!showUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(true)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Ingin gunakan link gambar URL langsung? Klik di sini</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 animate-fadeIn">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        URL Gambar Logo Sekolah (https://...)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          placeholder="https://example.com/logo-sekolah.png"
                          className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Terapkan
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* SECTION 2: PERIODE & JADWAL PEMILIHAN */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Periode & Jadwal Pemilihan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tahun Pelaksanaan / Periode Kepengurusan
              </label>
              <input
                type="text"
                required
                value={form.electionYear}
                onChange={(e) => setForm({ ...form, electionYear: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Waktu Mulai
                </label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Waktu Selesai
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: KONTROL STATUS VOTING & PUBLIKASI */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Power className="w-4 h-4 text-indigo-400" />
            <span>Kontrol Status Voting & Publikasi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Status Voting DIBUKA / DITUTUP */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Status Pemilihan (Voting)</p>
                  <p className="text-[11px] text-slate-400">Izinkan atau tutup akses bilik suara untuk siswa</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  form.votingStatus === 'DIBUKA'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {form.votingStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, votingStatus: 'DIBUKA' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    form.votingStatus === 'DIBUKA'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>DIBUKA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, votingStatus: 'DITUTUP' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    form.votingStatus === 'DITUTUP'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>DITUTUP</span>
                </button>
              </div>
            </div>

            {/* Status Real Count Publik DITAMPILKAN / DISEMBUNYIKAN */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Hasil Suara Publik</p>
                  <p className="text-[11px] text-slate-400">Tampilkan halaman Real Count kepada pemilih umum</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  form.publicResultStatus === 'DITAMPILKAN'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {form.publicResultStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, publicResultStatus: 'DITAMPILKAN' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    form.publicResultStatus === 'DITAMPILKAN'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>DITAMPILKAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, publicResultStatus: 'DISEMBUNYIKAN' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    form.publicResultStatus === 'DISEMBUNYIKAN'
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>DISEMBUNYIKAN</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: KEAMANAN & KATA SANDI ADMIN */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Kredensial Keamanan Admin</span>
          </h3>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              PIN / Password Akses Dashboard Admin
            </label>
            <input
              type="text"
              required
              value={form.adminPin}
              onChange={(e) => setForm({ ...form, adminPin: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan saat masuk ke halaman Admin. Standar default: <code className="text-amber-400 font-mono">admin123</code>
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Pastikan nama dan logo sekolah sudah sesuai sebelum menyimpan perubahan.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </button>
        </div>

      </form>

      {/* SECTION 5: STATUS DATABASE SUPABASE */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Status Koneksi Supabase Database</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Endpoint: <code className="text-emerald-400 font-mono text-[11px]">{SUPABASE_URL}</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              supabaseConnected
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{supabaseConnected ? 'Database Aktif & Terhubung' : 'Mode Offline / Local State'}</span>
            </span>

            <button
              onClick={() => syncWithSupabase()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Sinkronkan Ulang Sekarang"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">Skrip SQL Inisialisasi Supabase</span>
            <button
              onClick={handleCopySql}
              className="px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {showSqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{showSqlCopied ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">
            Jalankan skrip ini di menu <strong>SQL Editor</strong> pada dashboard proyek Supabase Anda untuk membuat tabel otomatis.
          </p>
          <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-36 border border-slate-800">
            {SUPABASE_SETUP_SQL.slice(0, 480)}...
          </pre>
        </div>

        {lastSyncedAt && (
          <p className="text-[11px] text-slate-500 text-right">
            Terakhir disinkronkan: {new Date(lastSyncedAt).toLocaleTimeString('id-ID')}
          </p>
        )}
      </div>

      {/* SECTION 6: DANGER ZONE - RESET PEMILIHAN */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-900/50 bg-rose-950/15 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Zona Berbahaya: Reset Seluruh Data Suara Pemilihan</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Tindakan ini akan mengosongkan seluruh surat suara yang masuk dan mengembalikan status seluruh siswa ({totalVoters} pemilih terdaftar) kembali menjadi status <span className="text-amber-400 font-bold">&quot;BELUM MEMILIH&quot;</span> sehingga hak suara dapat digunakan kembali.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400">Total Suara Masuk: </span>
                <span className="font-bold text-rose-400 font-mono">{totalVotes} suara</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400">Siswa Telah Memilih: </span>
                <span className="font-bold text-amber-400 font-mono">{votedCount} siswa</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Suara Pemilu</span>
            </button>
          </div>
        </div>

        {/* MODAL RESET CONFIRMATION DIALOG */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/90 border border-rose-700/80 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-xl shadow-rose-950/50">
                <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Konfirmasi Reset Suara
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Apakah Anda yakin ingin menghapus seluruh rekaman suara masuk?
              </p>

              {/* Warning Data Box */}
              <div className="my-5 p-4 rounded-2xl bg-slate-900 border border-rose-900/40 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total suara yang akan dihapus:</span>
                  <span className="font-bold text-rose-400 font-mono">{totalVotes} suara</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Pemilih yang statusnya direset:</span>
                  <span className="font-bold text-amber-400 font-mono">{votedCount} siswa</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  ⚠️ Setelah direset, seluruh NISN siswa dapat kembali digunakan untuk melakukan voting.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleExecuteResetAll}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mereset Data...</span>
                    </>
                  ) : (
                    <span>Ya, Reset Sekarang</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
