import React, { useState, useRef } from 'react';
import { useElection } from '../../context/ElectionContext';
import { DEFAULT_OSIS_EMBLEM, DEFAULT_CANDIDATE_PHOTO, DEFAULT_CANDIDATE_TWO_PHOTO } from '../../lib/sampleData';
import { Candidate } from '../../types';
import { 
  UserCheck, 
  Upload, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  UserPlus,
  AlertTriangle,
  X
} from 'lucide-react';

export const CandidateManagement: React.FC = () => {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useElection();

  const [selectedCandidateNumber, setSelectedCandidateNumber] = useState<string>(candidates[0]?.number || '01');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidateNumber, setDeleteCandidateNumber] = useState<string | null>(null);

  // Active candidate being edited
  const currentCandidate = candidates.find(c => c.number === selectedCandidateNumber) || candidates[0];

  const [form, setForm] = useState<Candidate>(() => currentCandidate || {
    number: '01',
    chairmanName: '',
    viceChairmanName: '',
    photoUrl: DEFAULT_CANDIDATE_PHOTO,
    vision: '',
    mission: [],
    programs: []
  });

  // Keep form in sync when user switches candidate
  React.useEffect(() => {
    if (currentCandidate) {
      setForm({
        number: currentCandidate.number,
        chairmanName: currentCandidate.chairmanName,
        viceChairmanName: currentCandidate.viceChairmanName,
        photoUrl: currentCandidate.photoUrl,
        vision: currentCandidate.vision,
        mission: [...currentCandidate.mission],
        programs: currentCandidate.programs ? [...currentCandidate.programs] : []
      });
    }
  }, [currentCandidate?.number]);

  const [newMissionItem, setNewMissionItem] = useState('');
  const [newProgramItem, setNewProgramItem] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Candidate Form State
  const [newCandForm, setNewCandForm] = useState({
    number: '',
    chairmanName: '',
    viceChairmanName: '',
    photoUrl: DEFAULT_CANDIDATE_TWO_PHOTO,
    vision: '',
    missionText: '',
    programsText: ''
  });
  const [newCandError, setNewCandError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCandFileInputRef = useRef<HTMLInputElement>(null);

  // Single Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isNewModal = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isNewModal) {
        setNewCandForm(prev => ({ ...prev, photoUrl: dataUrl }));
      } else {
        setForm(prev => ({ ...prev, photoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMission = () => {
    if (!newMissionItem.trim()) return;
    setForm(prev => ({
      ...prev,
      mission: [...prev.mission, newMissionItem.trim()]
    }));
    setNewMissionItem('');
  };

  const handleRemoveMission = (index: number) => {
    setForm(prev => ({
      ...prev,
      mission: prev.mission.filter((_, i) => i !== index)
    }));
  };

  const handleAddProgram = () => {
    if (!newProgramItem.trim()) return;
    setForm(prev => ({
      ...prev,
      programs: [...(prev.programs || []), newProgramItem.trim()]
    }));
    setNewProgramItem('');
  };

  const handleRemoveProgram = (index: number) => {
    setForm(prev => ({
      ...prev,
      programs: (prev.programs || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveCurrentCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    await updateCandidate({
      number: form.number,
      chairmanName: form.chairmanName.trim(),
      viceChairmanName: form.viceChairmanName.trim(),
      photoUrl: form.photoUrl,
      vision: form.vision.trim(),
      mission: form.mission,
      programs: form.programs,
    });

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Submit Add New Candidate
  const handleCreateNewCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCandError(null);

    const cleanNum = newCandForm.number.trim();
    if (!cleanNum || !newCandForm.chairmanName.trim() || !newCandForm.viceChairmanName.trim()) {
      setNewCandError('Nomor urut, nama ketua, dan nama wakil wajib diisi.');
      return;
    }

    const missionArr = newCandForm.missionText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const programsArr = newCandForm.programsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const res = await addCandidate({
      number: cleanNum,
      chairmanName: newCandForm.chairmanName.trim(),
      viceChairmanName: newCandForm.viceChairmanName.trim(),
      photoUrl: newCandForm.photoUrl || DEFAULT_CANDIDATE_PHOTO,
      vision: newCandForm.vision.trim() || 'Mewujudkan OSIS yang unggul dan inovatif.',
      mission: missionArr.length > 0 ? missionArr : ['Meningkatkan kinerja dan aspirasi siswa.'],
      programs: programsArr.length > 0 ? programsArr : ['Program kerja unggulan tahunan siswa.']
    });

    if (res.success) {
      setSelectedCandidateNumber(cleanNum.padStart(2, '0'));
      setIsAddModalOpen(false);
      setNewCandForm({
        number: '',
        chairmanName: '',
        viceChairmanName: '',
        photoUrl: DEFAULT_CANDIDATE_TWO_PHOTO,
        vision: '',
        missionText: '',
        programsText: ''
      });
    } else {
      setNewCandError(res.message);
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deleteCandidateNumber) return;
    const res = await deleteCandidate(deleteCandidateNumber);
    if (res.success) {
      const remaining = candidates.filter(c => c.number !== deleteCandidateNumber);
      if (remaining.length > 0) {
        setSelectedCandidateNumber(remaining[0].number);
      }
      setDeleteCandidateNumber(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Strip with Add Paslon button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Kelola Pasangan Calon (Paslon)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total {candidates.length} pasangan calon terdaftar dalam sistem pemilihan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccess && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Perubahan Disimpan!</span>
            </div>
          )}

          {/* ADD CANDIDATE BUTTON */}
          <button
            type="button"
            onClick={() => {
              // auto-suggest next number
              const nextNum = (candidates.length + 1).toString().padStart(2, '0');
              setNewCandForm(prev => ({ ...prev, number: nextNum }));
              setNewCandError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Paslon Baru</span>
          </button>
        </div>
      </div>

      {/* Candidate Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {candidates.map((cand) => {
          const isSelected = cand.number === selectedCandidateNumber;
          return (
            <div
              key={cand.number}
              className={`p-1.5 pr-3 rounded-2xl border transition-all flex items-center gap-2.5 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedCandidateNumber(cand.number)}
                className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                  <img
                    src={cand.photoUrl}
                    alt={cand.chairmanName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                    }}
                  />
                </div>
                <div>
                  <span className="text-xs font-black block">PASLON {cand.number}</span>
                  <span className={`text-[10px] block truncate max-w-[120px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {cand.chairmanName}
                  </span>
                </div>
              </button>

              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDeleteCandidateNumber(cand.number)}
                  className={`p-1 rounded-lg hover:bg-rose-950/60 hover:text-rose-400 transition-colors ml-1 ${
                    isSelected ? 'text-blue-200' : 'text-slate-500'
                  }`}
                  title="Hapus Paslon ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Candidate Edit Form */}
      {currentCandidate && (
        <form onSubmit={handleSaveCurrentCandidate} className="space-y-6">
          
          {/* SECTION 1: FOTO TUNGGAL PASLON */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/25">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Foto Paslon {form.number}
                </h3>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300">
                Nomor Urut: {form.number}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Live Photo Preview */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden ring-4 ring-blue-500/30 shadow-2xl bg-slate-900 group">
                  <img
                    src={form.photoUrl}
                    alt={`Paslon ${form.number}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OSIS_EMBLEM;
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-blue-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded shadow">
                    PASLON {form.number}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Pratinjau tampilan di bilik suara & hasil
                </p>
              </div>

              {/* Upload Controls & Rules */}
              <div className="md:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unggah foto pasangan calon (Ketua & Wakil). Cukup satu kali unggah, foto ini otomatis diterapkan serentak di halaman pemilihan, kartu paslon, dan real count.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => handlePhotoUpload(e, false)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Foto Paslon {form.number}...</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, photoUrl: DEFAULT_CANDIDATE_PHOTO }))}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gunakan Foto Standar</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>Foto paslon harus berformat PNG, JPG, atau WebP (maks. 5MB).</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: IDENTITAS KETUA & WAKIL KETUA */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
            <div className="flex items-center gap-2 mb-5">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Identitas Pasangan Calon {form.number}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap Calon Ketua OSIS
                </label>
                <input
                  type="text"
                  required
                  value={form.chairmanName}
                  onChange={(e) => setForm({ ...form, chairmanName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap Calon Wakil Ketua OSIS
                </label>
                <input
                  type="text"
                  required
                  value={form.viceChairmanName}
                  onChange={(e) => setForm({ ...form, viceChairmanName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: VISI */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">
              Visi Paslon {form.number}
            </h3>
            <textarea
              rows={3}
              required
              value={form.vision}
              onChange={(e) => setForm({ ...form, vision: e.target.value })}
              placeholder="Tuliskan pernyataan visi paslon..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm leading-relaxed focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* SECTION 4: MISI */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">
              Daftar Misi Paslon {form.number}
            </h3>

            <div className="space-y-2.5 mb-4">
              {form.mission.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMission(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Misi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambahkan butir misi baru..."
                value={newMissionItem}
                onChange={(e) => setNewMissionItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMission();
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddMission}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* SECTION 5: PROGRAM KERJA */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">
              Program Kerja Unggulan Paslon {form.number}
            </h3>

            <div className="space-y-2.5 mb-4">
              {(form.programs || []).map((prog, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                    ★
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 flex-1">{prog}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProgram(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Program"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambahkan nama & deskripsi program kerja unggulan..."
                value={newProgramItem}
                onChange={(e) => setNewProgramItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProgram();
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddProgram}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Paslon {form.number}</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

      {/* MODAL: TAMBAH PASLON BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Tambah Pasangan Calon Baru</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCandidate} className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Urut
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="02"
                    value={newCandForm.number}
                    onChange={(e) => setNewCandForm({ ...newCandForm, number: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Calon Ketua OSIS
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama calon ketua"
                    value={newCandForm.chairmanName}
                    onChange={(e) => setNewCandForm({ ...newCandForm, chairmanName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Calon Wakil Ketua OSIS
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama calon wakil ketua"
                  value={newCandForm.viceChairmanName}
                  onChange={(e) => setNewCandForm({ ...newCandForm, viceChairmanName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Photo Upload in Modal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Foto Paslon
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-blue-500/40 shrink-0 bg-slate-800">
                    <img
                      src={newCandForm.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    ref={newCandFileInputRef}
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, true)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newCandFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pilih Foto Paslon...</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Visi Paslon
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan pernyataan visi paslon..."
                  value={newCandForm.vision}
                  onChange={(e) => setNewCandForm({ ...newCandForm, vision: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Misi (1 baris per misi)
                </label>
                <textarea
                  rows={3}
                  placeholder="Meningkatkan partisipasi aktif...&#10;Mengembangkan literasi dan teknologi...&#10;Membangun kolaborasi antarekskul..."
                  value={newCandForm.missionText}
                  onChange={(e) => setNewCandForm({ ...newCandForm, missionText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Program Kerja (1 baris per program)
                </label>
                <textarea
                  rows={2}
                  placeholder="Digital Student Hub&#10;Pekan Kreativitas Siswa"
                  value={newCandForm.programsText}
                  onChange={(e) => setNewCandForm({ ...newCandForm, programsText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {newCandError && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs">
                  {newCandError}
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Tambah Paslon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteCandidateNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Hapus Paslon {deleteCandidateNumber}?</h3>
            <p className="text-xs text-slate-300 mt-1.5">
              Seluruh data visi misi dan suara yang masuk untuk paslon ini akan dihapus.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setDeleteCandidateNumber(null)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
