'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/types/product';

const productSchema = z.object({
  kode_barang_lama: z.string().optional(),
  kode_barang_baru: z.string().min(1, 'Kode barang baru wajib diisi'),
  keterangan: z.string().optional(),
  nomor_data: z.any().transform(v => v === '' ? undefined : Number(v)),
  nama_barang: z.string().min(1, 'Nama barang wajib diisi'),
  harga_grosir_min: z.any().transform(v => v === '' ? undefined : Number(v)),
  harga_grosir_max: z.any().transform(v => v === '' ? undefined : Number(v)),
  keterangan_harga_grosir: z.string().optional(),
  harga_satuan_min: z.any().transform(v => v === '' ? undefined : Number(v)),
  harga_satuan_max: z.any().transform(v => v === '' ? undefined : Number(v)),
  keterangan_harga_satuan: z.string().optional(),
  stock: z.any().transform(v => v === '' ? 0 : Number(v)),
  category: z.string().optional(),
});

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
        kode_barang_lama: product.kode_barang_lama || '',
        kode_barang_baru: product.kode_barang_baru,
        keterangan: product.keterangan || '',
        nomor_data: product.nomor_data || '',
        nama_barang: product.nama_barang,
        harga_grosir_min: product.harga_grosir_min || '',
        harga_grosir_max: product.harga_grosir_max || '',
        keterangan_harga_grosir: product.keterangan_harga_grosir || '',
        harga_satuan_min: product.harga_satuan_min || '',
        harga_satuan_max: product.harga_satuan_max || '',
        keterangan_harga_satuan: product.keterangan_harga_satuan || '',
        stock: product.stock || 0,
        category: product.category || '',
      }
      : {
        kode_barang_lama: '',
        kode_barang_baru: '',
        keterangan: '',
        nomor_data: '',
        nama_barang: '',
        harga_grosir_min: '',
        harga_grosir_max: '',
        keterangan_harga_grosir: '',
        harga_satuan_min: '',
        harga_satuan_max: '',
        keterangan_harga_satuan: '',
        stock: 0,
        category: '',
      },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kode_barang_lama">Kode Barang Lama</Label>
              <Input
                id="kode_barang_lama"
                {...register('kode_barang_lama')}
                placeholder="Opsional"
              />
            </div>
            <div>
              <Label htmlFor="kode_barang_baru">
                Kode Barang Baru <span className="text-red-500">*</span>
              </Label>
              <Input
                id="kode_barang_baru"
                {...register('kode_barang_baru')}
                placeholder="e.g., J006"
              />
              {errors.kode_barang_baru && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.kode_barang_baru.message as string}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="nama_barang">
              Nama Barang <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama_barang"
              {...register('nama_barang')}
              placeholder="e.g., ANTIMO SIRSAK GOLDEN CAIR 30 M2"
            />
            {errors.nama_barang && (
              <p className="mt-1 text-sm text-red-500">
                {errors.nama_barang.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nomor_data">Nomor Data</Label>
              <Input
                id="nomor_data"
                type="number"
                {...register('nomor_data')}
                placeholder="Opsional"
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Obat, Sembako"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              {...register('keterangan')}
              placeholder="Catatan opsional"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Harga Grosir */}
      <Card>
        <CardHeader>
          <CardTitle>Harga Grosir (Warungan)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="harga_grosir_min">Minimum</Label>
              <Input
                id="harga_grosir_min"
                type="number"
                {...register('harga_grosir_min')}
                placeholder="e.g., 3000"
              />
            </div>
            <div>
              <Label htmlFor="harga_grosir_max">Maximum</Label>
              <Input
                id="harga_grosir_max"
                type="number"
                {...register('harga_grosir_max')}
                placeholder="e.g., 3200"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="keterangan_harga_grosir">Keterangan</Label>
            <Input
              id="keterangan_harga_grosir"
              {...register('keterangan_harga_grosir')}
              placeholder="Catatan opsional"
            />
          </div>
        </CardContent>
      </Card>

      {/* Harga Satuan */}
      <Card>
        <CardHeader>
          <CardTitle>Harga Satuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="harga_satuan_min">Minimum</Label>
              <Input
                id="harga_satuan_min"
                type="number"
                {...register('harga_satuan_min')}
                placeholder="e.g., 3500"
              />
            </div>
            <div>
              <Label htmlFor="harga_satuan_max">Maximum</Label>
              <Input
                id="harga_satuan_max"
                type="number"
                {...register('harga_satuan_max')}
                placeholder="e.g., 3700"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="keterangan_harga_satuan">Keterangan</Label>
            <Input
              id="keterangan_harga_satuan"
              {...register('keterangan_harga_satuan')}
              placeholder="Catatan opsional"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stok */}
      <Card>
        <CardHeader>
          <CardTitle>Inventori</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              {...register('stock')}
              placeholder="e.g., 100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : product ? 'Perbarui Barang' : 'Tambahkan Barang'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}
