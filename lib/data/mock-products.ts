import { Product } from '../types/product';

// Mock data untuk testing frontend
export const mockProducts: Product[] = [
  {
    id: '1',
    kode_barang_lama: 'J005',
    kode_barang_baru: 'J006',
    keterangan: '',
    nomor_data: 1,
    nama_barang: 'ANTIMO SIRSAK GOLDEN CAIR 30 M2',
    harga_grosir_min: 3000,
    harga_grosir_max: 3200,
    keterangan_harga_grosir: '',
    harga_satuan_min: 3500,
    harga_satuan_max: 3700,
    keterangan_harga_satuan: '',
    stock: 100,
    category: 'Obat',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  },
  {
    id: '2',
    kode_barang_lama: 'J008',
    kode_barang_baru: 'J009',
    keterangan: '',
    nomor_data: 2,
    nama_barang: 'ANTIMO SIRSAK GOLDEN CAIR 60 M',
    harga_grosir_min: 5000,
    harga_grosir_max: 5200,
    keterangan_harga_grosir: '',
    harga_satuan_min: 5500,
    harga_satuan_max: 5700,
    keterangan_harga_satuan: '',
    stock: 50,
    category: 'Obat',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  },
  {
    id: '3',
    kode_barang_lama: '',
    kode_barang_baru: 'J016',
    keterangan: '',
    nomor_data: 3,
    nama_barang: 'ANTIMO HERBAL JAHE MERAH 30 M2',
    harga_grosir_min: 2800,
    harga_grosir_max: 3000,
    keterangan_harga_grosir: '',
    harga_satuan_min: 3200,
    harga_satuan_max: 3400,
    keterangan_harga_satuan: '',
    stock: 75,
    category: 'Obat',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  },
  {
    id: '4',
    kode_barang_baru: 'B001',
    nama_barang: 'BERAS PREMIUM 5KG',
    harga_grosir_min: 45000,
    harga_grosir_max: 47000,
    harga_satuan_min: 50000,
    harga_satuan_max: 52000,
    stock: 200,
    category: 'Sembako',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  },
  {
    id: '5',
    kode_barang_baru: 'M001',
    nama_barang: 'MINYAK GORENG 2L',
    harga_grosir_min: 28000,
    harga_grosir_max: 29000,
    harga_satuan_min: 32000,
    harga_satuan_max: 33000,
    stock: 150,
    category: 'Sembako',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  },
];

// Generate more mock products
const categories = ['Obat', 'Sembako', 'Minuman', 'Snack', 'Perawatan'];
const baseNames = [
  'ANTIMO', 'BERAS', 'MINYAK', 'GULA', 'TEPUNG',
  'KOPI', 'TEH', 'SUSU', 'SABUN', 'SAMPO'
];

for (let i = 6; i <= 50; i++) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
  const variant = ['PREMIUM', 'REGULER', 'SUPER', 'EKONOMIS', 'JUMBO'][Math.floor(Math.random() * 5)];

  mockProducts.push({
    id: i.toString(),
    kode_barang_baru: `${baseName[0]}${String(i).padStart(3, '0')}`,
    nama_barang: `${baseName} ${variant} ${Math.floor(Math.random() * 10) + 1}X`,
    harga_grosir_min: Math.floor(Math.random() * 50000) + 5000,
    harga_grosir_max: Math.floor(Math.random() * 50000) + 10000,
    harga_satuan_min: Math.floor(Math.random() * 50000) + 10000,
    harga_satuan_max: Math.floor(Math.random() * 50000) + 15000,
    stock: Math.floor(Math.random() * 200) + 10,
    category,
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-16T14:20:00Z',
  });
}
