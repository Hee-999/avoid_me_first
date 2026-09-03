-- Supabase Schema for Avoidance Reader

-- Enable pgcrypto for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Owner Verification (Hash)
  owner_token_hash TEXT NOT NULL,
  
  -- Sharing
  share_id TEXT UNIQUE,
  share_enabled BOOLEAN DEFAULT FALSE,
  
  -- Dimensions & Fitness
  anxiety_score INTEGER,
  avoidance_score INTEGER,
  secure_fit INTEGER,
  preoccupied_fit INTEGER,
  dismissive_fit INTEGER,
  fearful_fit INTEGER,
  
  -- Types & Confidence
  primary_type TEXT,
  secondary_type TEXT,
  confidence_score INTEGER,
  confidence_level TEXT,
  is_mixed_pattern BOOLEAN,
  
  -- Reports & Signals (JSON)
  extracted_signals JSONB,
  trigger_phrases JSONB,
  derived_context JSONB,
  premium_report JSONB,
  
  -- Status & Versions
  status JSONB,
  premium_unlocked BOOLEAN DEFAULT FALSE,
  premium_status TEXT DEFAULT 'pending',
  report_version TEXT,
  analysis_version TEXT
);

-- Basic RLS setup
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon (Next.js server API uses service_role anyway, but good practice)
-- Allow read for share_id if share_enabled is true
CREATE POLICY "Allow public read of shared analysis via share_id" ON analyses
  FOR SELECT
  USING (share_enabled = true);

-- Note: Most read/write operations will bypass RLS because we use the SUPABASE_SERVICE_ROLE_KEY
-- inside the Next.js API routes (Server-side) where we validate the owner_token_hash.
