// Product types based on database schema
export interface Product {
  id: string;
  kode_barang_lama?: string;
  kode_barang_baru: string;
  keterangan?: string;
  nomor_data?: number;
  nama_barang: string;
  harga_grosir_min?: number;
  harga_grosir_max?: number;
  keterangan_harga_grosir?: string;
  harga_satuan_min?: number;
  harga_satuan_max?: number;
  keterangan_harga_satuan?: string;
  stock: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'readonly' | 'pending';
  created_at: string;
}
