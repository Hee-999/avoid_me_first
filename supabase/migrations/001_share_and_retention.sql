-- Migration: 001_share_and_retention.sql

ALTER TABLE analyses
ADD COLUMN share_alias TEXT,
ADD COLUMN share_token_hash TEXT,
ADD COLUMN report_access_token_hash TEXT,
ADD COLUMN purchased_at TIMESTAMPTZ,
ADD COLUMN expires_at TIMESTAMPTZ;

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
