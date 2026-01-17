-- ============================================
-- UPDATE: Add 'pending' role untuk approval flow
-- ============================================

-- Step 1: Update role constraint untuk allow 'pending'
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('admin', 'readonly', 'pending'));

-- Step 2: Update default role untuk user baru jadi 'pending'
ALTER TABLE profiles
ALTER COLUMN role SET DEFAULT 'pending';

-- Step 3: Update existing 'readonly' users jika mau (optional)
-- Uncomment jika mau semua readonly user saat ini jadi pending:
-- UPDATE profiles SET role = 'pending' WHERE role = 'readonly';

-- ============================================
-- DONE! Sekarang user baru akan punya role 'pending'
-- ============================================
