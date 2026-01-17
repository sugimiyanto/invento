# Plan: Web App Inventory Management untuk Toko

## Requirements Summary
- **Users**: 1-5 orang (owner + penjaga toko)
- **Items**: <1000 barang
- **Access**: Online only
- **Auth**: Google Login
- **Roles**:
  - Admin: CRUD barang, import CSV, manage users & permissions
  - Readonly: Search & view barang saja
- **Data**: Existing data dalam Excel/CSV
- **Budget**: **Gratis/semurah mungkin**

## Recommended Tech Stack (100% Gratis)

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** untuk type safety
- **Tailwind CSS** untuk styling cepat
- **shadcn/ui** untuk komponen UI siap pakai
- **React Hook Form + Zod** untuk form validation
- **Tanstack Table** untuk tabel data barang

### Backend & Database
- **Supabase** (Free tier)
  - PostgreSQL database (500MB gratis)
  - Authentication (Google OAuth sudah built-in)
  - Row Level Security (RLS) untuk RBAC
  - Storage untuk file CSV
  - Real-time subscriptions (bonus)
  - API auto-generated

### Deployment
- **Vercel** (Free tier)
  - Hosting Next.js gratis
  - Auto deploy dari Git
  - SSL certificate gratis
  - Global CDN

### Total Biaya: **$0/bulan**
Free tier limits:
- Supabase: 500MB DB, 1GB file storage, 2GB bandwidth
- Vercel: 100GB bandwidth, unlimited deployments

## Database Schema

```sql
-- Users table (extended dari Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'readonly')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table (disesuaikan dengan struktur Excel existing)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_barang_lama TEXT, -- Kode barang lama
  kode_barang_baru TEXT NOT NULL, -- Kode barang baru (primary identifier)
  keterangan TEXT, -- Keterangan
  nomor_data INTEGER, -- Nomor data
  nama_barang TEXT NOT NULL, -- Nama barang
  harga_grosir_min DECIMAL(15,2), -- Harga grosir (warungan) min
  harga_grosir_max DECIMAL(15,2), -- Harga grosir (warungan) max
  keterangan_harga_grosir TEXT, -- Keterangan harga grosir
  harga_satuan_min DECIMAL(15,2), -- Harga satuan min
  harga_satuan_max DECIMAL(15,2), -- Harga satuan max
  keterangan_harga_satuan TEXT, -- Keterangan harga satuan
  stock INTEGER DEFAULT 0, -- Stock (optional, bisa ditambah nanti)
  category TEXT, -- Kategori untuk grouping
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(kode_barang_baru) -- Ensure kode baru is unique
);

-- Index untuk search performance
CREATE INDEX idx_products_nama ON products USING gin(to_tsvector('indonesian', nama_barang));
CREATE INDEX idx_products_kode_baru ON products(kode_barang_baru);
CREATE INDEX idx_products_kode_lama ON products(kode_barang_lama) WHERE kode_barang_lama IS NOT NULL;
CREATE INDEX idx_products_category ON products(category);

-- Audit log (optional tapi bagus untuk tracking)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'import'
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Admin bisa lihat semua, readonly cuma bisa lihat profile sendiri
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admin can manage profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: Semua authenticated user bisa read, cuma admin bisa write
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit logs: Admin only
CREATE POLICY "Admin can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Project Structure

```
invento/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page dengan Google OAuth
│   │   └── callback/
│   │       └── route.ts           # OAuth callback handler
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard layout dengan navbar
│   │   ├── page.tsx               # Home/dashboard
│   │   ├── products/
│   │   │   ├── page.tsx           # List & search products (semua user)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Detail product
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # Add new product (admin only)
│   │   │   ├── [id]/edit/
│   │   │   │   └── page.tsx       # Edit product (admin only)
│   │   │   └── import/
│   │   │       └── page.tsx       # Import CSV (admin only)
│   │   └── users/
│   │       └── page.tsx           # User management (admin only)
│   └── api/
│       ├── products/
│       │   └── import/
│       │       └── route.ts       # API untuk parse & import CSV
│       └── users/
│           └── route.ts           # API untuk manage users
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── products/
│   │   ├── ProductTable.tsx       # Table dengan search & sort
│   │   ├── ProductForm.tsx        # Form add/edit
│   │   ├── ProductDetail.tsx      # Detail view
│   │   └── CSVImportDialog.tsx    # CSV import UI
│   ├── users/
│   │   └── UserManagementTable.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── auth/
│       └── GoogleSignInButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── hooks/
│   │   ├── useProducts.ts         # React Query hooks
│   │   ├── useUsers.ts
│   │   └── useAuth.ts
│   ├── utils/
│   │   ├── csv-parser.ts          # CSV parsing utility
│   │   ├── validators.ts          # Zod schemas
│   │   └── format.ts              # Format currency, dates
│   └── types/
│       └── database.ts            # TypeScript types dari Supabase
├── middleware.ts                  # Next.js middleware untuk auth check
├── .env.local                     # Environment variables
└── supabase/
    ├── migrations/                # Database migrations
    └── seed.sql                   # Initial data seeding
```

## Feature Implementation Details

### 1. Authentication & Authorization

**Setup Supabase Auth:**
- Enable Google OAuth di Supabase dashboard
- Configure authorized redirect URLs
- Set up OAuth credentials dari Google Cloud Console

**Auth Flow:**
1. User klik "Sign in with Google"
2. Redirect ke Google OAuth
3. Callback ke `/auth/callback`
4. Create/update profile di `profiles` table
5. Redirect ke dashboard

**Authorization Check:**
- Middleware Next.js cek auth status
- Protected routes: redirect ke login jika belum auth
- Admin-only pages: cek role dari profile
- Client-side: hide/disable UI berdasarkan role
- Server-side: RLS policies enforce di database level

### 2. Product Management

**Search & View (All Users):**
- Table dengan search bar (debounced)
- Filter by category
- Sort by name, price, stock
- Pagination (50 items per page)
- Click row untuk view detail
- Full-text search menggunakan PostgreSQL `ts_vector`

**CRUD Operations (Admin Only):**

**Create:**
- Form dengan fields: kode_barang_lama, kode_barang_baru, keterangan, nomor_data, nama_barang, harga_grosir_min, harga_grosir_max, keterangan_harga_grosir, harga_satuan_min, harga_satuan_max, keterangan_harga_satuan, stock, category
- Client-side validation dengan Zod
- Server-side validation + RLS
- Success: redirect ke detail page

**Update:**
- Pre-fill form dengan existing data
- Same validation
- Audit log untuk tracking changes

**Delete:**
- Confirmation dialog
- Soft delete (optional) atau hard delete
- Audit log

**CSV Import:**
- Upload CSV file
- Preview table untuk validasi
- Show errors jika ada (invalid data, duplicate SKU)
- Bulk insert dengan transaction
- Progress indicator
- Summary report (X berhasil, Y gagal)

**CSV Format Expected (sesuai dengan Excel existing):**
```csv
kode_barang_lama,kode_barang_baru,keterangan,nomor_data,nama_barang,harga_grosir_min,harga_grosir_max,keterangan_harga_grosir,harga_satuan_min,harga_satuan_max,keterangan_harga_satuan,stock,category
J005,J006,,1,ANTIMO SIRSAK GOLDEN CAIR 30 M2,3000,3200,,3500,3700,,100,Obat
J008,J009,,2,ANTIMO SIRSAK GOLDEN CAIR 60 M,5000,5200,,5500,5700,,50,Obat
,J016,,3,ANTIMO HERBAL JAHE MERAH 30 M2,2800,3000,,3200,3400,,75,Obat
```

### 3. User Management (Admin Only)

**Features:**
- View all registered users
- Assign/change roles (admin/readonly)
- Remove user access (soft delete dari profiles, tidak delete dari auth.users)
- Users harus login dengan Google dulu sebelum admin bisa assign role
- Default role: readonly (untuk safety)

**Flow:**
1. User baru login dengan Google
2. Auto-create profile dengan role = 'readonly'
3. Admin masuk ke user management
4. Admin change role jadi 'admin' kalau perlu

### 4. Dashboard Home

**Readonly Users:**
- Quick search box
- Recent products viewed
- Basic stats (total products)

**Admin Users:**
- Stats cards: total products, low stock alerts, total inventory value
- Quick actions: Add product, Import CSV
- Recent activity log

## Development Workflow

### Phase 1: Setup (Day 1)
1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest invento --typescript --tailwind --app
   cd invento
   ```

2. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install @tanstack/react-query @tanstack/react-table
   npm install react-hook-form zod @hookform/resolvers
   npm install papaparse date-fns
   npm install -D @types/papaparse
   ```

3. **Setup shadcn/ui**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button input table dialog form card badge
   ```

4. **Setup Supabase**
   - Create Supabase project (gratis)
   - Get API keys
   - Configure `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```

### Phase 2: Database & Auth (Day 1-2)
1. **Run migrations** (create tables di Supabase SQL Editor)
2. **Setup RLS policies**
3. **Configure Google OAuth** di Supabase + Google Cloud Console
4. **Implement auth pages**: login, callback
5. **Setup middleware** untuk protected routes
6. **Test auth flow**

### Phase 3: Core Features (Day 2-4)
1. **Product listing & search**
   - Table component dengan Tanstack Table
   - Search dengan debounce
   - Pagination

2. **Product detail view**
   - Read-only detail page
   - Show all fields formatted

3. **Product CRUD (admin)**
   - Create form dengan validation
   - Edit form
   - Delete dengan confirmation
   - Test dengan different roles

4. **CSV Import**
   - File upload
   - Parse dengan papaparse
   - Validation & preview
   - Bulk insert
   - Error handling

### Phase 4: User Management (Day 4)
1. **User list page**
2. **Role assignment**
3. **Test RBAC thoroughly**

### Phase 5: Polish & Deploy (Day 5)
1. **UI/UX improvements**
   - Loading states
   - Error messages
   - Success toasts
   - Responsive design

2. **Initial data import** (dari CSV existing)

3. **Deploy ke Vercel**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Push to GitHub
   # Connect to Vercel
   # Add environment variables di Vercel
   # Deploy
   ```

4. **Setup first admin user**
   - Login pertama kali dengan Google
   - Manually update role di Supabase dashboard jadi 'admin'
   - Atau create seed script

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables set di Vercel
- [ ] Supabase production instance ready
- [ ] Google OAuth credentials configured untuk production domain
- [ ] Database migrations applied
- [ ] RLS policies enabled & tested

### Vercel Setup
1. Connect GitHub repo
2. Framework preset: Next.js
3. Environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Post-deployment
- [ ] Update Supabase authorized redirect URLs dengan domain Vercel
- [ ] Update Google OAuth authorized origins & redirect URIs
- [ ] Create first admin user
- [ ] Import initial data via CSV
- [ ] Test all flows di production
- [ ] Share link dengan team

## Security Considerations

1. **RLS is Critical**: Semua table harus enable RLS, ini yang enforce permissions
2. **Never expose service_role key**: Cuma pakai anon key di client
3. **Validate di server**: Jangan cuma validate di client
4. **Audit logs**: Track semua perubahan data penting
5. **HTTPS only**: Vercel auto provide SSL
6. **Rate limiting**: Supabase built-in rate limiting on free tier

## Scalability Path (Jika Bisnis Berkembang)

**Current (Free):**
- 1-5 users
- <1000 products
- Gratis selamanya

**Growth Options:**
1. **Supabase Pro ($25/mo)**: 8GB database, 100GB bandwidth, daily backups
2. **Vercel Pro ($20/mo)**: More bandwidth, better analytics
3. **Add features**: Barcode scanning, inventory alerts, reporting, multi-location

**Tetap Murah:** Sampai ratusan users & ribuan products, total biaya <$50/mo

## Maintenance & Support

**Backup:**
- Supabase auto backup (Pro tier)
- Manual export via dashboard (Free tier)
- Regular CSV export sebagai backup alternatif

**Updates:**
- Next.js & dependencies: Update quarterly
- Supabase auto-managed
- Zero downtime deployment via Vercel

**Monitoring:**
- Vercel Analytics (free tier basic)
- Supabase dashboard untuk database metrics
- Error tracking: bisa add Sentry free tier jika perlu

## Alternative Options Considered

### Option 2: Firebase (Ditolak)
- Auth: ✅ Google OAuth
- Database: Firestore (NoSQL, kurang cocok untuk relational data)
- Cost: Sama gratis, tapi **Firestore pricing lebih mahal** kalau scale
- Cons: Kurang bagus untuk complex queries & RBAC

### Option 3: Vercel Postgres + NextAuth (Ditolak)
- Database: Vercel Postgres (free tier cuma 256MB, lebih kecil dari Supabase)
- Auth: NextAuth.js (harus setup sendiri)
- Cons: **Lebih kompleks**, lebih kecil free tier

### Option 4: Cloudflare Pages + D1 (Ditolak)
- Cons: D1 masih beta, dokumentasi kurang, **lebih eksperimental**

**Winner: Supabase + Next.js + Vercel**
- Paling simple
- Best free tier
- Production-ready
- Dokumentasi lengkap
- Perfect untuk use case ini

## Success Criteria

✅ **Functional:**
- Admin bisa login dengan Google
- Admin bisa add/edit/delete barang
- Admin bisa import CSV
- Admin bisa manage users & roles
- Readonly user bisa search & view barang
- Readonly user TIDAK bisa edit/delete

✅ **Performance:**
- Search hasil <500ms
- Page load <2s
- CSV import 1000 rows <10s

✅ **Security:**
- RLS policies tested
- No unauthorized access
- Audit trail working

✅ **Deployment:**
- Live di production URL
- SSL enabled
- Mobile responsive

## Estimated Timeline

- **Setup & Auth**: 1 hari
- **Core features**: 2-3 hari
- **Polish & deploy**: 1 hari
- **Total**: **4-5 hari kerja**

Untuk developer experienced dengan Next.js + Supabase bisa lebih cepat (~2-3 hari).

## Next Steps After Approval

1. Initialize Next.js project
2. Setup Supabase project & get credentials
3. Create database schema & migrations
4. Implement authentication flow
5. Build product management features
6. Build user management
7. Import initial data
8. Deploy to production
9. Train users

---

**Ini adalah solusi paling cost-effective untuk bisnis kecil dengan requirement Anda. 100% gratis dan production-ready.**
