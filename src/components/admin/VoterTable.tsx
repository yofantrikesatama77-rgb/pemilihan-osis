import React, { useState, useMemo, useRef } from 'react';
import { useElection } from '../../context/ElectionContext';
import { Voter } from '../../types';
import { 
  Users, 
  Search, 
  UserPlus, 
  Upload, 
  Download, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  X, 
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const VoterTable: React.FC = () => {
  const {
    voters,
    addVoter,
    updateVoter,
    deleteVoter,
    resetVoterStatus,
    importVoters,
    resetAllVotes,
    totalVotes,
    votedCount
  } = useElection();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
  const [isResettingAll, setIsResettingAll] = useState(false);
  const [resetTableSuccess, setResetTableSuccess] = useState<string | null>(null);

  const handleExecuteResetAllVoters = async () => {
    setIsResettingAll(true);
    try {
      const res = await resetAllVotes();
      setIsResettingAll(false);
      setIsResetAllModalOpen(false);
      if (res?.success) {
        setResetTableSuccess(res.message);
        setTimeout(() => setResetTableSuccess(null), 5000);
      }
    } catch {
      setIsResettingAll(false);
      setIsResetAllModalOpen(false);
    }
  };

  // Form states for Add Voter
  const [addForm, setAddForm] = useState({ nisn: '', name: '', class: '' });
  const [addError, setAddError] = useState<string | null>(null);

  // Form states for Edit Voter
  const [editForm, setEditForm] = useState({ nisn: '', name: '', class: '' });

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<{ added: number; skipped: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Distinct classes for filter
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    voters.forEach(v => {
      if (v.class) set.add(v.class);
    });
    return Array.from(set).sort();
  }, [voters]);

  // Filtered voters
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      const matchSearch =
        v.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.class.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'VOTED'
          ? v.hasVoted
          : !v.hasVoted;

      const matchClass =
        classFilter === 'ALL' ? true : v.class === classFilter;

      return matchSearch && matchStatus && matchClass;
    });
  }, [voters, searchQuery, statusFilter, classFilter]);

  // Add Voter submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!addForm.nisn.trim() || !addForm.name.trim() || !addForm.class.trim()) {
      setAddError('Semua kolom wajib diisi.');
      return;
    }

    const res = await addVoter({
      nisn: addForm.nisn.trim(),
      name: addForm.name.trim(),
      class: addForm.class.trim(),
    });

    if (res.success) {
      setAddForm({ nisn: '', name: '', class: '' });
      setIsAddModalOpen(false);
    } else {
      setAddError(res.message);
    }
  };

  // Edit Voter submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoter) return;

    await updateVoter(editingVoter.id, {
      nisn: editForm.nisn.trim(),
      name: editForm.name.trim(),
      class: editForm.class.trim(),
    });

    setEditingVoter(null);
  };

  // Handle CSV file
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        // Header check (skip line 1 if contains 'nisn' or 'nama')
        const startIndex = lines[0].toLowerCase().includes('nisn') ? 1 : 0;
        const parsedList: Array<{ nisn: string; name: string; class: string }> = [];

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 2 && cols[0]) {
            parsedList.push({
              nisn: cols[0],
              name: cols[1] || 'Siswa',
              class: cols[2] || 'Umum',
            });
          }
        }

        const summary = await importVoters(parsedList);
        setImportSummary(summary);
      } catch (err) {
        console.error('CSV parse error', err);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'nisn,nama,kelas\n' +
      '0078123420,Aditya Nugraha,XII MIPA 1\n' +
      '0078123421,Bella Amanda,XII MIPA 2\n' +
      '0078123422,Cindy Claudia,XI IPS 1\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_dpt_pemilih_osis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Data Pemilih Tetap (DPT)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total {voters.length} siswa terdaftar · {voters.filter(v => v.hasVoted).length} telah memilih ({voters.filter(v => !v.hasVoted).length} belum memilih)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {resetTableSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{resetTableSuccess}</span>
            </div>
          )}

          <button
            onClick={() => setIsResetAllModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-xs font-bold text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm hover:text-white"
            title="Reset seluruh suara dan kembalikan semua siswa ke status BELUM MEMILIH"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Data Suara</span>
          </button>

          <button
            onClick={handleDownloadSampleCsv}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Unduh Format CSV"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Template CSV</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => {
              setAddForm({ nisn: '', name: '', class: '' });
              setAddError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pemilih</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan NISN, Nama, atau Kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Status ({voters.length})</option>
            <option value="NOT_VOTED">Belum Memilih ({voters.filter(v => !v.hasVoted).length})</option>
            <option value="VOTED">Sudah Memilih ({voters.filter(v => v.hasVoted).length})</option>
          </select>
        </div>

        {/* Class Filter */}
        {uniqueClasses.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0 hidden sm:inline">Kelas:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        )}

      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Status Memilih</th>
                <th className="py-3 px-4">Waktu Memilih</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Tidak ada data pemilih yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter, index) => (
                  <tr 
                    key={voter.id}
                    className="hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {voter.nisn}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-200">
                      {voter.name}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                        {voter.class}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SUDAH MEMILIH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 border border-amber-800/60 text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>BELUM MEMILIH</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                      {voter.votedAt
                        ? new Date(voter.votedAt).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '-'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setEditingVoter(voter);
                            setEditForm({
                              nisn: voter.nisn,
                              name: voter.name,
                              class: voter.class,
                            });
                          }}
                          title="Ubah Data Siswa"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Reset status button (allows student to re-vote for testing) */}
                        {voter.hasVoted && (
                          <button
                            onClick={() => resetVoterStatus(voter.id)}
                            title="Reset Status ke Belum Memilih"
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/50 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => setDeleteConfirmId(voter.id)}
                          title="Hapus Pemilih"
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* MODAL 1: ADD VOTER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Tambah Siswa Pemilih</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor NISN (10 Digit)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0078123499"
                  value={addForm.nisn}
                  onChange={(e) => setAddForm({ ...addForm, nisn: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XII MIPA 2"
                  value={addForm.class}
                  onChange={(e) => setAddForm({ ...addForm, class: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {addError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
                  {addError}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Simpan Pemilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT VOTER */}
      {editingVoter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Ubah Data Siswa</h3>
              <button onClick={() => setEditingVoter(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor NISN
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nisn}
                  onChange={(e) => setEditForm({ ...editForm, nisn: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  required
                  value={editForm.class}
                  onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVoter(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: IMPORT CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Import Data Pemilih dari CSV</h3>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSummary(null);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Unggah file CSV dengan kolom header: <code className="text-blue-400 font-mono">nisn,nama,kelas</code>. Sistem akan otomatis menyaring dan mengabaikan NISN yang sudah terdaftar.
              </p>

              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-colors text-center cursor-pointer bg-slate-900/60"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">Klik untuk memilih file CSV</p>
                <p className="text-[11px] text-slate-500 mt-1">Format .csv (Comma Delimited)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </div>

              {isImporting && (
                <div className="flex items-center justify-center gap-2 text-xs text-blue-400 py-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span>Sedang memproses data CSV...</span>
                </div>
              )}

              {importSummary && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <p className="font-bold text-white mb-1">Hasil Import:</p>
                  <p className="text-emerald-400">✓ Berhasil ditambahkan: {importSummary.added} siswa</p>
                  <p className="text-slate-400">ℹ Dilewati (duplikat/kosong): {importSummary.skipped} siswa</p>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Contoh File CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportSummary(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Hapus Pemilih?</h3>
            <p className="text-xs text-slate-300 mt-1.5">
              Data pemilih ini akan dihapus dari daftar DPT secara permanen.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  await deleteVoter(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RESET ALL VOTES CONFIRMATION */}
      {isResetAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-rose-950/90 border border-rose-700/80 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-xl shadow-rose-950/50">
              <RotateCcw className="w-8 h-8 text-rose-400" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Reset Seluruh Suara Masuk?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Tindakan ini akan mengosongkan seluruh perolehan suara paslon dan mengembalikan status semua siswa menjadi <strong>&quot;BELUM MEMILIH&quot;</strong>.
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-900 border border-rose-900/40 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total suara yang akan dihapus:</span>
                <span className="font-bold text-rose-400 font-mono">{totalVotes} suara</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Siswa yang statusnya direset:</span>
                <span className="font-bold text-amber-400 font-mono">{votedCount} siswa</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Data DPT pemilih tidak dihapus, hanya status memilihnya yang dikembalikan agar siswa dapat memilih ulang.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isResettingAll}
                onClick={() => setIsResetAllModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResettingAll}
                onClick={handleExecuteResetAllVoters}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResettingAll ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mereset...</span>
                  </>
                ) : (
                  <span>Ya, Reset Suara</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
