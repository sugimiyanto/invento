# Panduan Setup Backend - Invento

## Langkah 1: Setup Supabase Account & Project

### A. Buat Akun Supabase (GRATIS)

1. **Buka browser dan kunjungi:** https://supabase.com
2. **Klik "Start your project"** atau **"Sign Up"**
3. **Sign up dengan GitHub** (recommended) atau email
   - Jika pakai GitHub: Klik "Continue with GitHub" → Authorize
   - Jika pakai email: Masukkan email & password → Verify email

### B. Buat Project Baru

1. **Setelah login, klik "New Project"**
2. **Isi form:**
   - **Name**: `invento` (atau nama lain yang Anda suka)
   - **Database Password**: Buat password yang KUAT (minimal 12 karakter)
     - ⚠️ **PENTING**: Simpan password ini! Anda akan butuh nanti
     - Contoh: `InVenTo2024!SecurePass`
   - **Region**: Pilih **Singapore** (paling dekat dengan Indonesia)
   - **Pricing Plan**: Pilih **Free** ($0/month)
3. **Klik "Create new project"**
4. **Tunggu 1-2 menit** sambil Supabase setup database Anda

### C. Dapatkan API Keys

Setelah project selesai dibuat:

1. **Di sidebar kiri, klik icon ⚙️ "Settings"**
2. **Klik "API"** di menu settings
3. **Copy 2 values ini** (akan kita pakai nanti):
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon/public key** (di bagian "Project API keys")

**⚠️ JANGAN COPY `service_role` key** - itu untuk server-side saja!

---

## Langkah 2: Buat Database Schema

### A. Buka SQL Editor

1. **Di sidebar kiri, klik icon 📊 "SQL Editor"**
2. **Klik "New query"**

### B. Copy-Paste Schema Ini

Copy semua SQL di bawah ini dan paste ke SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (User Management)
-- =====================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'readonly')) DEFAULT 'readonly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE (Barang)
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_barang_lama TEXT,
  kode_barang_baru TEXT NOT NULL,
  keterangan TEXT,
  nomor_data INTEGER,
  nama_barang TEXT NOT NULL,
  harga_grosir_min DECIMAL(15,2),
  harga_grosir_max DECIMAL(15,2),
  keterangan_harga_grosir TEXT,
  harga_satuan_min DECIMAL(15,2),
  harga_satuan_max DECIMAL(15,2),
  keterangan_harga_satuan TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_kode_barang_baru UNIQUE(kode_barang_baru)
);

-- =====================================================
-- AUDIT LOGS TABLE (Tracking Changes)
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES (Performance Optimization)
-- =====================================================
CREATE INDEX idx_products_nama ON products USING gin(to_tsvector('indonesian', nama_barang));
CREATE INDEX idx_products_kode_baru ON products(kode_barang_baru);
CREATE INDEX idx_products_kode_lama ON products(kode_barang_lama) WHERE kode_barang_lama IS NOT NULL;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SECURITY!
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES POLICIES =====

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Admin can update all profiles
CREATE POLICY "Admin can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Auto-create profile on signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ===== PRODUCTS POLICIES =====

-- All authenticated users can view products
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admin can create products
CREATE POLICY "Admin can create products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admin can update products
CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admin can delete products
CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ===== AUDIT LOGS POLICIES =====

-- Only admin can view audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- All authenticated users can create audit logs (system usage)
CREATE POLICY "Authenticated users can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### C. Jalankan Query

1. **Klik tombol "Run"** (atau tekan Ctrl+Enter / Cmd+Enter)
2. **Tunggu sampai muncul "Success. No rows returned"**
3. ✅ **Database schema berhasil dibuat!**

### D. Verifikasi Tables

1. **Di sidebar kiri, klik icon 🗄️ "Table Editor"**
2. **Anda harus melihat 3 tables:**
   - `profiles`
   - `products`
   - `audit_logs`

---

## Langkah 3: Setup Google OAuth

### A. Buat Google Cloud Project

1. **Buka:** https://console.cloud.google.com/
2. **Login dengan Google account Anda**
3. **Klik dropdown "Select a project"** di navbar atas
4. **Klik "NEW PROJECT"**
5. **Isi:**
   - **Project name**: `Invento` (atau nama lain)
   - **Location**: Tidak perlu diubah (No organization)
6. **Klik "CREATE"**
7. **Tunggu ~30 detik**, kemudian pilih project yang baru dibuat

### B. Enable Google+ API

1. **Di search bar atas, ketik "Google+ API"** atau buka: https://console.cloud.google.com/apis/library/plus.googleapis.com
2. **Klik "Google+ API"** dari hasil search
3. **Klik "ENABLE"**
4. **Tunggu sampai enabled**

### C. Configure OAuth Consent Screen

1. **Di sidebar kiri, klik "Branding"**
   - Anda akan melihat halaman "OAuth consent screen branding"

2. **Isi form branding (jika belum terisi):**
   - **App name**: `Invento`
   - **User support email**: Pilih email Anda dari dropdown
   - **App logo**: Boleh dilewati (opsional)
   - **Application home page**: `http://localhost:3000` (untuk sekarang)
   - **Authorized domains**: Boleh dikosongkan dulu
   - **Developer contact information**: Masukkan email Anda

3. **Klik "SAVE"** di bawah form

4. **Jika sudah terisi sebelumnya, Anda bisa skip langkah ini dan lanjut ke Langkah D**

6. **Di halaman "Scopes":**
   - **Klik "ADD OR REMOVE SCOPES"**
   - Scroll dan centang:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - **Klik "UPDATE"**
   - **Klik "SAVE AND CONTINUE"**

7. **Di halaman "Test users":**
   - **Klik "ADD USERS"**
   - **Masukkan email Google yang akan Anda pakai untuk login** (email Anda sendiri)
   - **Klik "ADD"**
   - **Klik "SAVE AND CONTINUE"**

8. **Klik "BACK TO DASHBOARD"**

### D. Create OAuth Credentials

1. **Di sidebar kiri, klik "Credentials"**
   - Atau buka: https://console.cloud.google.com/apis/credentials
2. **Klik "CREATE CREDENTIALS" → "OAuth client ID"**
3. **Pilih:**
   - **Application type**: `Web application`
   - **Name**: `Invento`
4. **Authorized JavaScript origins:**
   - Klik "ADD URI"
   - Masukkan: `http://localhost:3000`
   - Klik "ADD URI" lagi
   - Masukkan URL Supabase Anda: `https://xxxxx.supabase.co` (ganti xxxxx)
5. **Authorized redirect URIs:**
   - Klik "ADD URI"
   - Masukkan: `https://xxxxx.supabase.co/auth/v1/callback`
     - ⚠️ **PENTING**: Ganti `xxxxx` dengan Project URL Supabase Anda!
6. **Klik "CREATE"**
7. **Modal akan muncul dengan:**
   - **Client ID** (copy ini!)
   - **Client Secret** (copy ini!)
8. ✅ **Simpan kedua values ini** - kita butuh nanti!

---

## Langkah 4: Configure Supabase Auth

### A. Kembali ke Supabase Dashboard

1. **Buka Supabase dashboard:** https://app.supabase.com
2. **Pilih project `invento-2` Anda**

### B. Enable Google Provider

1. **Di sidebar kiri, klik ⚙️ "Settings"**
2. **Klik "Authentication"**
3. **Scroll ke bawah ke bagian "Auth Providers"**
4. **Cari "Google" dan klik untuk expand**
5. **Isi:**
   - **Enable Google**: Toggle ON (hijau)
   - **Client ID**: Paste Client ID dari Google Cloud Console
   - **Client Secret**: Paste Client Secret dari Google Cloud Console
6. **Klik "Save"**

### C. Configure Site URL

1. **Masih di Authentication settings**
2. URL Configuraiton "Site URL"
3. **Masukkan:** `http://localhost:3000` (untuk development)
4. **Klik "Save"**

### D. Configure Redirect URLs

1. **Masih di Authentication settings**
2. **Scroll ke "Redirect URLs"**
3. **Klik "Add URL"**
4. **Masukkan:** `http://localhost:3000/auth/callback`
5. **Klik "Save"**

---

## Langkah 5: Update Environment Variables

Sekarang kita akan setup environment variables di project Next.js Anda.

### Update .env.local

Saya akan buatkan file `.env.local` dengan credentials Supabase dan Google OAuth Anda.

**Anda perlu memberikan saya:**
1. ✅ Supabase Project URL (dari Langkah 1.C)
2. ✅ Supabase anon key (dari Langkah 1.C)

Setelah itu saya akan:
1. Install Supabase dependencies
2. Setup Supabase client
3. Implement authentication
4. Replace mock data dengan real API calls

---

## Status Checklist

**Silakan selesaikan langkah-langkah di atas, kemudian:**

- [ ] Supabase project sudah dibuat
- [ ] Database schema sudah dijalankan (3 tables terbuat)
- [ ] Google Cloud project sudah dibuat
- [ ] OAuth consent screen sudah dikonfigurasi
- [ ] OAuth credentials sudah dibuat (punya Client ID & Secret)
- [ ] Google provider di Supabase sudah enabled
- [ ] Sudah punya Supabase Project URL dan anon key

**Setelah checklist di atas selesai, berikan saya:**
1. Supabase Project URL
2. Supabase anon key

**Saya akan lanjutkan dengan:**
1. Install dependencies
2. Setup Supabase client
3. Implement Google OAuth authentication
4. Replace mock data dengan real Supabase queries
5. Test semua functionality

---

## Bantuan & Troubleshooting

Jika ada yang stuck atau error, screenshot dan tanya saja! Saya akan bantu troubleshoot.
