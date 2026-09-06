-- Supabase Schema for Avoidance Reader

-- Enable pgcrypto for gen_random_uuid() if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Owner Verification (Hash)
  owner_token_hash TEXT NOT NULL,
  
  -- Sharing
  share_id TEXT UNIQUE, -- DEPRECATED (Kept for backward compatibility)
  share_enabled BOOLEAN DEFAULT FALSE,
  share_alias TEXT,
  share_token_hash TEXT,
  
  -- Premium Archive
  report_access_token_hash TEXT,
  
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
  analysis_version TEXT,
  
  -- Retention Policy
  purchased_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Index for cron job performance
CREATE INDEX IF NOT EXISTS idx_analyses_expires_at ON analyses(expires_at);

-- Cleanup function (pg_cron)
CREATE OR REPLACE FUNCTION cleanup_expired_analyses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM analyses
  WHERE expires_at <= NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % expired analyses.', deleted_count;
END;
$$;

-- Schedule the cleanup to run daily at 3:00 AM
-- Ensure pg_cron is enabled in Supabase project extensions
SELECT cron.schedule(
  'cleanup-expired-analyses-daily',
  '0 3 * * *',
  'SELECT cleanup_expired_analyses();'
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
