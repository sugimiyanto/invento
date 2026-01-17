# Panduan Deployment: Invento

Dokumen ini menjelaskan langkah-langkah untuk mendeploy aplikasi **Invento** ke produksi menggunakan **Vercel** dan **Supabase**.

## Prasyarat
1. Akun [GitHub](https://github.com), [Vercel](https://vercel.com), dan [Supabase](https://supabase.com).
2. Proyek Supabase yang sudah dikonfigurasi dengan tabel `profiles`, `products`, dan `audit_logs` (lihat file `supabase-setup.sql` jika perlu mengulang).

---

## Langkah 1: Persiapan Repository (Git)

Pastikan semua kode terbaru sudah di-commit dan di-push ke repository Git Anda (misal: GitHub).

```bash
git add .
git commit -m "feat: siap untuk deployment produksi"
git push origin main
```

---

## Langkah 2: Deployment ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard).
2. Klik tombol **"Add New"** lalu pilih **"Project"**.
3. Cari repository **invento_2** Anda dan klik **"Import"**.
4. Di bagian **Environment Variables**, tambahkan variabel berikut dari file `.env.local` Anda:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Klik **"Deploy"**.
6. Setelah proses selesai, Vercel akan memberikan domain (misal: `invento-2.vercel.app`). **Salin alamat ini**.

---

## Langkah 3: Konfigurasi Supabase (Authentication)

Supabase perlu tahu ke mana harus mengarahkan user setelah login Google di domain produksi.

1. Buka Dashboard [Supabase](https://supabase.com/dashboard).
2. Pergi ke menu **Authentication** > **URL Configuration**.
3. **Site URL**: Ganti dengan alamat domain Vercel Anda (misal: `https://invento-2.vercel.app`).
4. **Redirect URLs**: Tambahkan satu baris baru: `https://invento-2.vercel.app/auth/callback`.
5. Jangan lupa klik **Save**.
6. (Opsional) Di bagian **Authentication** > **Providers** > **Google**, pastikan statusnya "Enabled" jika Anda sudah melakukan setup Google Cloud Console.

---

## Langkah 4: Aktivasi Admin Pertama

Karena fitur keamanan kita secara otomatis memberikan peran **"pending"** (Menunggu Persetujuan) pada user baru, Anda perlu mengangkat diri Anda sendiri menjadi Admin melalui database.

1. Buka aplikasi yang sudah live di Vercel.
2. Login menggunakan akun Google utama Anda.
3. Anda akan diarahkan ke halaman **"Menunggu Persetujuan"**. Ini normal.
4. Buka Dashboard **Supabase** > **Table Editor** > pilih tabel `profiles`.
5. Cari baris dengan email Anda.
6. Klik dua kali pada kolom `role` yang berisi `'pending'`, lalu ganti menjadi `'admin'`.
7. Tekan Enter untuk menyimpan.
8. Kembali ke aplikasi Anda dan **Refresh** halaman. Anda sekarang memiliki akses Admin penuh!

---

## Langkah 5: Import Data Awal (Opsional)

Jika Anda memiliki data dari Excel/CSV sebelumnya:
1. Masuk ke aplikasi sebagai Admin.
2. Pergi ke menu **Barang** > Klik **Import CSV**.
3. Gunakan template yang tersedia untuk memastikan format kolom sesuai.
4. Upload, cek pratinjau, dan klik **Import**.

---

## Tips & Troubleshooting

- **Login Gagal?**: Cek kembali `REDIRECT_URIS` di Supabase dan pastikan sudah menggunakan `https://` (bukan `http://`).
- **Data Tidak Muncul?**: Cek apakah RLS (Row Level Security) sudah aktif di Supabase Dashboard. Semua tabel harus memiliki policy yang mengizinkan akses (sudah ada di `supabase-setup.sql`).
- **Update Kode?**: Setiap kali Anda melakukan `git push`, Vercel akan otomatis melakukan update (Auto-deploy).

---

**Selamat! Aplikasi Invento Anda sekarang sudah online dan siap digunakan.**
