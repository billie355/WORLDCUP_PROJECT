-- ============================================================
-- 002_staff_role.sql — Add 'staff' role to profiles
-- ============================================================

-- Alter the role CHECK constraint to include 'staff'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'staff', 'admin'));

-- Index to quickly find staff/admin users
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
