import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://idhgqtmqzhfthrvxfixx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaGdxdG1xemhmdGhydnhmaXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MjUzOTQsImV4cCI6MjEwNjIwMTM5NH0.ujb0HHaxHXgUruR0pmQWdib1x3TkYQd1KV4oCJv2tWQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

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

CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Update Settings" ON public.settings FOR ALL USING (true);

CREATE POLICY "Public Read Candidate" ON public.candidate FOR SELECT USING (true);
CREATE POLICY "Public Update Candidate" ON public.candidate FOR ALL USING (true);

CREATE POLICY "Public Read Voters" ON public.voters FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Voters" ON public.voters FOR ALL USING (true);

CREATE POLICY "Public Manage Votes" ON public.votes FOR ALL USING (true);

-- 6. REALTIME REPLICATION ENABLE
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
`;
