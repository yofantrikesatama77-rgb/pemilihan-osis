import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://idhgqtmqzhfthrvxfixx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaGdxdG1xemhmdGhydnhmaXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjUzOTQsImV4cCI6MjEwNjIwMTM5NH0.ujb0HHaxHXgUruR0pmQWdib1x3TkYQd1KV4oCJv2tWQ';

function getValidSupabaseUrl(): string {
  try {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    if (typeof envUrl === 'string' && envUrl.trim()) {
      const trimmed = envUrl.trim();
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
    }
  } catch {
    // If invalid URL, gracefully use default
  }
  return DEFAULT_SUPABASE_URL;
}

function getValidSupabaseKey(): string {
  try {
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (
      typeof envKey === 'string' &&
      envKey.trim().length > 20 &&
      !envKey.includes('MY_') &&
      !envKey.includes('YOUR_')
    ) {
      return envKey.trim();
    }
  } catch {
    // If invalid key, gracefully use default
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const SUPABASE_URL = getValidSupabaseUrl();
export const SUPABASE_ANON_KEY = getValidSupabaseKey();

let clientInstance: any;
try {
  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (err) {
  console.warn('Supabase client custom init warning, using default connection:', err);
  clientInstance = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = clientInstance;

// SQL Schema for user reference and setup in Supabase SQL editor
export const SUPABASE_SETUP_SQL = `-- ==========================================
-- SKEMA DATABASE E-VOTING OSIS (SUPABASE)
-- Jalankan skrip ini di Supabase SQL Editor
-- ==========================================

-- 1. TABEL SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'current_election',
  school_name TEXT NOT NULL DEFAULT 'SMA NEGERI 1 TELADAN',
  school_logo_url TEXT DEFAULT '',
  election_year TEXT NOT NULL DEFAULT '2026/2027',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  voting_status TEXT NOT NULL DEFAULT 'DIBUKA',
  public_result_status TEXT NOT NULL DEFAULT 'DITAMPILKAN',
  admin_pin TEXT NOT NULL DEFAULT 'admin123',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL CANDIDATE
CREATE TABLE IF NOT EXISTS public.candidate (
  number TEXT PRIMARY KEY,
  chairman_name TEXT NOT NULL,
  vice_chairman_name TEXT NOT NULL,
  photo_url TEXT,
  vision TEXT,
  mission JSONB DEFAULT '[]'::jsonb,
  programs JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL VOTERS
CREATE TABLE IF NOT EXISTS public.voters (
  id TEXT PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  has_voted BOOLEAN DEFAULT FALSE,
  voted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL VOTES (Audit Trail Suara Masuk)
CREATE TABLE IF NOT EXISTS public.votes (
  vote_id TEXT PRIMARY KEY,
  candidate_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  masked_nisn TEXT,
  token TEXT
);

-- 5. ROW LEVEL SECURITY (RLS) - Buka akses publik anon untuk pembacaan & voting
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses (Drop jika sudah ada agar aman dijalankan berulang kali tanpa error)
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Settings" ON public.settings;
CREATE POLICY "Public Update Settings" ON public.settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Candidate" ON public.candidate;
CREATE POLICY "Public Read Candidate" ON public.candidate FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Candidate" ON public.candidate;
CREATE POLICY "Public Update Candidate" ON public.candidate FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Voters" ON public.voters;
CREATE POLICY "Public Read Voters" ON public.voters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert/Update Voters" ON public.voters;
CREATE POLICY "Public Insert/Update Voters" ON public.voters FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Manage Votes" ON public.votes;
CREATE POLICY "Public Manage Votes" ON public.votes FOR ALL USING (true);

-- 6. REALTIME REPLICATION ENABLE (Aman dari error duplicate_object jika sudah ditambahkan)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.voters;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
`;
