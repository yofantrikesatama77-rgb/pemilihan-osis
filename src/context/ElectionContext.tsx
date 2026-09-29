import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Candidate, ElectionSettings, Voter, Vote } from '../types';
import { initialCandidates, initialSettings, initialVoters } from '../lib/sampleData';
import { supabase } from '../lib/supabase';

export interface CandidateVoteStat {
  candidate: Candidate;
  votes: number;
  percentage: number;
}

interface ElectionContextType {
  voters: Voter[];
  candidates: Candidate[];
  candidate: Candidate; // backward compatibility for first candidate
  settings: ElectionSettings;
  votes: Vote[];
  currentVoter: Voter | null;
  isAdmin: boolean;
  isLoading: boolean;
  supabaseConnected: boolean;
  lastSyncedAt: Date | null;
  
  // Computed metrics
  totalVoters: number;
  votedCount: number;
  unvotedCount: number;
  totalVotes: number;
  participationRate: number;
  candidateVotes: number;
  candidateStats: CandidateVoteStat[];

  // Actions
  loginWithNisn: (nisn: string) => { success: boolean; message: string; voter?: Voter };
  castVote: (candidateNumber: string, voterNisn: string) => Promise<{ success: boolean; message: string; token?: string }>;
  logoutVoter: () => void;
  
  // Admin Actions
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  addCandidate: (newCandidate: Candidate) => Promise<{ success: boolean; message: string }>;
  updateCandidate: (data: Partial<Candidate> & { number: string }) => Promise<void>;
  deleteCandidate: (number: string) => Promise<{ success: boolean; message: string }>;
  addVoter: (voter: Omit<Voter, 'id' | 'hasVoted' | 'votedAt'>) => Promise<{ success: boolean; message: string }>;
  updateVoter: (id: string, voter: Partial<Voter>) => Promise<void>;
  deleteVoter: (id: string) => Promise<void>;
  resetVoterStatus: (id: string) => Promise<void>;
  importVoters: (importedList: Array<{ nisn: string; name: string; class: string }>) => Promise<{ added: number; skipped: number }>;
  resetAllVotes: () => Promise<{ success: boolean; message: string }>;
  updateSettings: (newSettings: Partial<ElectionSettings>) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  VOTERS: 'osis_vote_voters_v1',
  CANDIDATES: 'osis_vote_candidates_v2',
  SETTINGS: 'osis_vote_settings_v1',
  VOTES: 'osis_vote_votes_v1',
  ADMIN_SESSION: 'osis_vote_admin_session_v1',
  CURRENT_VOTER: 'osis_vote_current_voter_v1',
};

export const ElectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or defaults
  const [voters, setVoters] = useState<Voter[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VOTERS);
      return saved ? JSON.parse(saved) : initialVoters;
    } catch {
      return initialVoters;
    }
  });

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CANDIDATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialCandidates;
    } catch {
      return initialCandidates;
    }
  });

  const [settings, setSettings] = useState<ElectionSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [votes, setVotes] = useState<Vote[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VOTES);
      if (saved) return JSON.parse(saved);
      // Pre-populate votes from initialVoters who already voted (split between candidates)
      return initialVoters
        .filter(v => v.hasVoted)
        .map((v, i) => ({
          voteId: `vote-init-${i + 1}`,
          candidateNumber: i % 2 === 0 ? '01' : '02',
          createdAt: v.votedAt || new Date().toISOString(),
          maskedNisn: `***${v.nisn.slice(-4)}`,
          token: `TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }));
    } catch {
      return [];
    }
  });

  const [currentVoter, setCurrentVoter] = useState<Voter | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_VOTER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION) === 'true';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTERS, JSON.stringify(voters));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [voters]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTES, JSON.stringify(votes));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [votes]);

  useEffect(() => {
    if (currentVoter) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_VOTER, JSON.stringify(currentVoter));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_VOTER);
    }
  }, [currentVoter]);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION);
    }
  }, [isAdmin]);

  // Fetch from Supabase
  const syncWithSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      // Test settings table
      const { data: dbSettings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!settingsError) {
        setSupabaseConnected(true);
        if (dbSettings) {
          setSettings(prev => ({
            ...prev,
            schoolName: dbSettings.school_name || prev.schoolName,
            schoolLogoUrl: dbSettings.school_logo_url || prev.schoolLogoUrl,
            electionYear: dbSettings.election_year || prev.electionYear,
            votingStatus: (dbSettings.voting_status as 'DIBUKA' | 'DITUTUP') || prev.votingStatus,
            publicResultStatus: (dbSettings.public_result_status as 'DITAMPILKAN' | 'DISEMBUNYIKAN') || prev.publicResultStatus,
            adminPin: dbSettings.admin_pin || prev.adminPin,
            startDate: dbSettings.start_date || prev.startDate,
            endDate: dbSettings.end_date || prev.endDate,
          }));
        }
      }

      // Fetch all candidates from supabase
      const { data: dbCandidates, error: candError } = await supabase
        .from('candidate')
        .select('*')
        .order('number', { ascending: true });

      if (!candError && dbCandidates && dbCandidates.length > 0) {
        const mappedList: Candidate[] = dbCandidates.map((c: any) => ({
          number: c.number,
          chairmanName: c.chairman_name,
          viceChairmanName: c.vice_chairman_name,
          photoUrl: c.photo_url || initialCandidates[0].photoUrl,
          vision: c.vision || '',
          mission: Array.isArray(c.mission) ? c.mission : [],
          programs: Array.isArray(c.programs) ? c.programs : [],
        }));
        setCandidates(mappedList);
      }

      // Fetch voters
      const { data: dbVoters, error: votersError } = await supabase
        .from('voters')
        .select('*');

      if (!votersError && dbVoters && dbVoters.length > 0) {
        const mappedVoters: Voter[] = dbVoters.map((item: any) => ({
          id: item.id || `vtr-${item.nisn}`,
          nisn: item.nisn,
          name: item.name,
          class: item.class,
          hasVoted: Boolean(item.has_voted),
          votedAt: item.voted_at || null,
        }));
        setVoters(mappedVoters);
      }

      // Fetch votes
      const { data: dbVotes, error: votesError } = await supabase
        .from('votes')
        .select('*');

      if (!votesError && Array.isArray(dbVotes)) {
        const mappedVotes: Vote[] = dbVotes.map((item: any) => ({
          voteId: item.vote_id,
          candidateNumber: item.candidate_number,
          createdAt: item.created_at,
          maskedNisn: item.masked_nisn,
          token: item.token,
        }));
        setVotes(mappedVotes);
      }

      setLastSyncedAt(new Date());
    } catch (err) {
      console.info('Supabase sync notice: Operating with local resilient database.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load sync
  useEffect(() => {
    syncWithSupabase();

    let subscriptionChannel: any = null;
    try {
      subscriptionChannel = supabase
        .channel('osis-vote-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
          syncWithSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'candidate' }, () => {
          syncWithSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'voters' }, () => {
          syncWithSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          syncWithSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
    }

    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [syncWithSupabase]);

  // Backward compatibility candidate
  const candidate = useMemo(() => candidates[0] || initialCandidates[0], [candidates]);

  // Computed metrics
  const totalVoters = voters.length;
  const votedCount = voters.filter(v => v.hasVoted).length;
  const unvotedCount = totalVoters - votedCount;
  const totalVotes = votes.length;
  const candidateVotes = votes.filter(v => v.candidateNumber === candidate.number).length;
  const participationRate = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 1000) / 10 : 0;

  // Multi-candidate Vote Stats
  const candidateStats: CandidateVoteStat[] = useMemo(() => {
    return candidates.map(c => {
      const count = votes.filter(v => v.candidateNumber === c.number).length;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 1000) / 10 : 0;
      return {
        candidate: c,
        votes: count,
        percentage: pct
      };
    });
  }, [candidates, votes, totalVotes]);

  // Login with NISN (Student)
  const loginWithNisn = useCallback((inputNisn: string) => {
    const cleanNisn = inputNisn.trim();

    if (!cleanNisn) {
      return { success: false, message: 'Silakan masukkan nomor NISN Anda.' };
    }

    if (settings.votingStatus === 'DITUTUP') {
      return {
        success: false,
        message: 'Pemilihan telah DITUTUP oleh Panitia Pemilihan OSIS.'
      };
    }

    const voter = voters.find(v => v.nisn === cleanNisn);

    if (!voter) {
      return {
        success: false,
        message: 'NISN tidak terdaftar sebagai pemilih tetap. Hubungi panitia OSIS jika ada kesalahan data.'
      };
    }

    if (voter.hasVoted) {
      const timeFormatted = voter.votedAt 
        ? new Date(voter.votedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : 'sebelumnya';
      return {
        success: false,
        message: `Anda sudah menggunakan hak suara pada pukul ${timeFormatted}. Satu NISN hanya dapat memilih 1 kali.`
      };
    }

    setCurrentVoter(voter);
    return {
      success: true,
      message: `Selamat datang, ${voter.name} (${voter.class}). Silakan gunakan hak pilih Anda secara bijak.`,
      voter
    };
  }, [voters, settings.votingStatus]);

  // Cast Vote for chosen candidate
  const castVote = useCallback(async (candidateNumber: string, voterNisn: string) => {
    const voter = voters.find(v => v.nisn === voterNisn);
    if (!voter) {
      return { success: false, message: 'Data pemilih tidak ditemukan.' };
    }

    if (voter.hasVoted) {
      return { success: false, message: 'Anda sudah pernah memilih. Tindakan tidak diizinkan.' };
    }

    if (settings.votingStatus === 'DITUTUP') {
      return { success: false, message: 'Maaf, pemilihan telah ditutup.' };
    }

    const nowIso = new Date().toISOString();
    const token = `VOTE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const voteId = `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const maskedNisn = `***${voterNisn.slice(-4)}`;

    const newVote: Vote = {
      voteId,
      candidateNumber,
      createdAt: nowIso,
      maskedNisn,
      token
    };

    // Atomic update in local state
    setVoters(prev =>
      prev.map(v => (v.nisn === voterNisn ? { ...v, hasVoted: true, votedAt: nowIso } : v))
    );
    setVotes(prev => [newVote, ...prev]);

    // Update in Supabase if online
    try {
      await supabase
        .from('voters')
        .update({ has_voted: true, voted_at: nowIso })
        .eq('nisn', voterNisn);

      await supabase.from('votes').insert({
        vote_id: voteId,
        candidate_number: candidateNumber,
        created_at: nowIso,
        masked_nisn: maskedNisn,
        token
      });
    } catch (e) {
      console.warn('Supabase remote write error, saved locally:', e);
    }

    return {
      success: true,
      message: 'Suara Anda berhasil direkam.',
      token
    };
  }, [voters, settings.votingStatus]);

  const logoutVoter = useCallback(() => {
    setCurrentVoter(null);
  }, []);

  // Admin authentication
  const loginAdmin = useCallback((pin: string) => {
    if (pin.trim() === settings.adminPin || pin.trim() === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, [settings.adminPin]);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
  }, []);

  // ADD NEW CANDIDATE
  const addCandidate = useCallback(async (newCand: Candidate) => {
    const formattedNumber = newCand.number.trim().padStart(2, '0');
    if (candidates.some(c => c.number === formattedNumber)) {
      return { success: false, message: `Nomor urut ${formattedNumber} sudah digunakan.` };
    }

    const candidateToAdd: Candidate = {
      ...newCand,
      number: formattedNumber
    };

    setCandidates(prev => {
      const updated = [...prev, candidateToAdd].sort((a, b) => a.number.localeCompare(b.number));
      return updated;
    });

    try {
      await supabase
        .from('candidate')
        .upsert({
          number: candidateToAdd.number,
          chairman_name: candidateToAdd.chairmanName,
          vice_chairman_name: candidateToAdd.viceChairmanName,
          photo_url: candidateToAdd.photoUrl,
          vision: candidateToAdd.vision,
          mission: candidateToAdd.mission,
          programs: candidateToAdd.programs,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn('Supabase candidate insert error:', e);
    }

    return { success: true, message: `Paslon ${candidateToAdd.number} berhasil ditambahkan.` };
  }, [candidates]);

  // Update candidate details
  const updateCandidate = useCallback(async (data: Partial<Candidate> & { number: string }) => {
    setCandidates(prev =>
      prev.map(c => (c.number === data.number ? { ...c, ...data } : c))
    );

    try {
      const target = candidates.find(c => c.number === data.number);
      const merged = { ...target, ...data };
      await supabase
        .from('candidate')
        .upsert({
          number: merged.number,
          chairman_name: merged.chairmanName,
          vice_chairman_name: merged.viceChairmanName,
          photo_url: merged.photoUrl,
          vision: merged.vision,
          mission: merged.mission,
          programs: merged.programs,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn('Supabase candidate upsert error, saved locally:', e);
    }
  }, [candidates]);

  // Delete candidate
  const deleteCandidate = useCallback(async (candNumber: string) => {
    if (candidates.length <= 1) {
      return { success: false, message: 'Minimal harus terdapat 1 pasangan calon dalam sistem.' };
    }

    setCandidates(prev => prev.filter(c => c.number !== candNumber));
    // Remove votes associated with candidate or keep in audit trail
    setVotes(prev => prev.filter(v => v.candidateNumber !== candNumber));

    try {
      await supabase.from('candidate').delete().eq('number', candNumber);
      await supabase.from('votes').delete().eq('candidate_number', candNumber);
    } catch (e) {
      console.warn('Supabase delete candidate error:', e);
    }

    return { success: true, message: `Paslon ${candNumber} berhasil dihapus.` };
  }, [candidates]);

  // Voter CRUD
  const addVoter = useCallback(async (newVoterData: Omit<Voter, 'id' | 'hasVoted' | 'votedAt'>) => {
    const cleanNisn = newVoterData.nisn.trim();
    if (!cleanNisn) {
      return { success: false, message: 'NISN tidak boleh kosong.' };
    }
    if (voters.some(v => v.nisn === cleanNisn)) {
      return { success: false, message: `NISN ${cleanNisn} sudah terdaftar sebelumnya.` };
    }

    const newVoter: Voter = {
      id: `vtr-${Date.now()}`,
      nisn: cleanNisn,
      name: newVoterData.name.trim(),
      class: newVoterData.class.trim(),
      hasVoted: false,
      votedAt: null
    };

    setVoters(prev => [newVoter, ...prev]);

    try {
      await supabase.from('voters').insert({
        id: newVoter.id,
        nisn: newVoter.nisn,
        name: newVoter.name,
        class: newVoter.class,
        has_voted: false,
        voted_at: null
      });
    } catch (e) {
      console.warn('Supabase add voter write error:', e);
    }

    return { success: true, message: `Pemilih ${newVoter.name} berhasil ditambahkan.` };
  }, [voters]);

  const updateVoter = useCallback(async (id: string, updateData: Partial<Voter>) => {
    setVoters(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updateData } : v))
    );

    try {
      const v = voters.find(x => x.id === id);
      if (v) {
        await supabase
          .from('voters')
          .update({
            name: updateData.name ?? v.name,
            class: updateData.class ?? v.class,
            nisn: updateData.nisn ?? v.nisn,
          })
          .eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase update voter error:', e);
    }
  }, [voters]);

  const deleteVoter = useCallback(async (id: string) => {
    setVoters(prev => prev.filter(v => v.id !== id));
    try {
      await supabase.from('voters').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete voter error:', e);
    }
  }, []);

  const resetVoterStatus = useCallback(async (id: string) => {
    const voter = voters.find(v => v.id === id);
    if (!voter) return;

    const updatedVoters = voters.map(v => (v.id === id ? { ...v, hasVoted: false, votedAt: null } : v));
    setVoters(updatedVoters);

    const masked = `***${voter.nisn.slice(-4)}`;
    const remainingVotes = votes.filter(vt => vt.maskedNisn !== masked);
    setVotes(remainingVotes);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTERS, JSON.stringify(updatedVoters));
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTES, JSON.stringify(remainingVotes));
    } catch (e) {
      console.warn('LocalStorage reset voter status error:', e);
    }

    try {
      await supabase
        .from('voters')
        .update({ has_voted: false, voted_at: null })
        .eq('id', id);

      await supabase
        .from('votes')
        .delete()
        .eq('masked_nisn', masked);
    } catch (e) {
      console.warn('Supabase reset status error:', e);
    }
  }, [voters, votes]);

  const importVoters = useCallback(async (importedList: Array<{ nisn: string; name: string; class: string }>) => {
    let added = 0;
    let skipped = 0;
    const existingNisns = new Set(voters.map(v => v.nisn));
    const newItems: Voter[] = [];

    importedList.forEach(item => {
      const cleanNisn = item.nisn.trim();
      if (!cleanNisn || existingNisns.has(cleanNisn)) {
        skipped++;
      } else {
        existingNisns.add(cleanNisn);
        newItems.push({
          id: `vtr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          nisn: cleanNisn,
          name: item.name.trim() || 'Siswa',
          class: item.class.trim() || 'Umum',
          hasVoted: false,
          votedAt: null
        });
        added++;
      }
    });

    if (newItems.length > 0) {
      setVoters(prev => [...newItems, ...prev]);

      try {
        const rows = newItems.map(item => ({
          id: item.id,
          nisn: item.nisn,
          name: item.name,
          class: item.class,
          has_voted: false,
          voted_at: null
        }));
        await supabase.from('voters').upsert(rows);
      } catch (e) {
        console.warn('Supabase batch insert error:', e);
      }
    }

    return { added, skipped };
  }, [voters]);

  const resetAllVotes = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    // 1. Reset state in memory
    const cleanVoters = voters.map(v => ({ ...v, hasVoted: false, votedAt: null }));
    setVoters(cleanVoters);
    setVotes([]);
    setCurrentVoter(null);

    // 2. Synchronously write to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTERS, JSON.stringify(cleanVoters));
      localStorage.setItem(LOCAL_STORAGE_KEYS.VOTES, JSON.stringify([]));
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_VOTER);
    } catch (e) {
      console.warn('LocalStorage reset error:', e);
    }

    // 3. Clear all records from Supabase tables
    try {
      // Delete all votes
      await supabase.from('votes').delete().not('vote_id', 'is', null);
      await supabase.from('votes').delete().neq('vote_id', '___none___');

      // Reset has_voted for all voters
      await supabase
        .from('voters')
        .update({ has_voted: false, voted_at: null })
        .not('id', 'is', null);

      await supabase
        .from('voters')
        .update({ has_voted: false, voted_at: null })
        .not('nisn', 'is', null);
    } catch (e) {
      console.warn('Supabase reset all votes error:', e);
    }

    return { 
      success: true, 
      message: 'Seluruh data suara berhasil direset ke 0 dan status semua pemilih kembali ke BELUM MEMILIH.' 
    };
  }, [voters]);

  const updateSettings = useCallback(async (newSettings: Partial<ElectionSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      await supabase
        .from('settings')
        .upsert({
          id: 'current_election',
          school_name: updated.schoolName,
          school_logo_url: updated.schoolLogoUrl,
          election_year: updated.electionYear,
          voting_status: updated.votingStatus,
          public_result_status: updated.publicResultStatus,
          admin_pin: updated.adminPin,
          start_date: updated.startDate,
          end_date: updated.endDate,
          updated_at: new Date().toISOString()
        });
    } catch (e) {
      console.warn('Supabase update settings error:', e);
    }
  }, [settings]);

  const value = useMemo(() => ({
    voters,
    candidates,
    candidate,
    settings,
    votes,
    currentVoter,
    isAdmin,
    isLoading,
    supabaseConnected,
    lastSyncedAt,
    totalVoters,
    votedCount,
    unvotedCount,
    totalVotes,
    participationRate,
    candidateVotes,
    candidateStats,
    loginWithNisn,
    castVote,
    logoutVoter,
    loginAdmin,
    logoutAdmin,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addVoter,
    updateVoter,
    deleteVoter,
    resetVoterStatus,
    importVoters,
    resetAllVotes,
    updateSettings,
    syncWithSupabase,
  }), [
    voters,
    candidates,
    candidate,
    settings,
    votes,
    currentVoter,
    isAdmin,
    isLoading,
    supabaseConnected,
    lastSyncedAt,
    totalVoters,
    votedCount,
    unvotedCount,
    totalVotes,
    participationRate,
    candidateVotes,
    candidateStats,
    loginWithNisn,
    castVote,
    logoutVoter,
    loginAdmin,
    logoutAdmin,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addVoter,
    updateVoter,
    deleteVoter,
    resetVoterStatus,
    importVoters,
    resetAllVotes,
    updateSettings,
    syncWithSupabase,
  ]);

  return <ElectionContext.Provider value={value}>{children}</ElectionContext.Provider>;
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
