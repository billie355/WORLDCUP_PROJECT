-- ============================================================
-- 003_ban_system.sql — Enhanced ban system for profiles
-- ============================================================

-- Add ban detail columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ban_reason      TEXT,
  ADD COLUMN IF NOT EXISTS ban_message     TEXT,
  ADD COLUMN IF NOT EXISTS ban_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS banned_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS banned_at       TIMESTAMPTZ;

-- Index for quick ban expiry lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ban_expires ON public.profiles(ban_expires_at)
  WHERE is_banned = TRUE;
