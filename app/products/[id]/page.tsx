'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useProduct, deleteProduct } from '@/lib/hooks/useProducts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { product, isLoading } = useProduct(params.id as string);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus "${product.nama_barang}"?`)) {
      try {
        setIsDeleting(true);
        await deleteProduct(product.id);
        toast.success('Barang berhasil dihapus!');
        router.push('/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Gagal menghapus barang. Silakan coba lagi.');
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail barang...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-2">Barang Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">
            Barang yang Anda cari tidak ditemukan.
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Barang
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Detail Barang</h2>
            </div>
          </div>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Link href={`/products/${product.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Ubah
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{product.nama_barang}</CardTitle>
                <div className="mt-2 flex gap-2">
                  {product.category && (
                    <Badge variant="outline">{product.category}</Badge>
                  )}
                  <Badge
                    variant={product.stock < 20 ? 'destructive' : 'default'}
                  >
                    Stok: {product.stock}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Codes */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Kode Barang Baru
                </h3>
                <p className="mt-1 text-lg font-semibold">
                  {product.kode_barang_baru}
                </p>
              </div>
              {product.kode_barang_lama && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Kode Barang Lama
                  </h3>
                  <p className="mt-1 text-lg font-semibold">
                    {product.kode_barang_lama}
                  </p>
                </div>
              )}
              {product.nomor_data && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Nomor Data
                  </h3>
                  <p className="mt-1 text-lg font-semibold">
                    {product.nomor_data}
                  </p>
                </div>
              )}
            </div>

            {/* Keterangan */}
            {product.keterangan && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Keterangan
                </h3>
                <p className="mt-1">{product.keterangan}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Harga</h3>

              {/* Harga Grosir */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Harga Grosir (Warungan)
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Minimum</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(product.harga_grosir_min)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Maksimum</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(product.harga_grosir_max)}
                    </p>
                  </div>
                </div>
                {product.keterangan_harga_grosir && (
                  <p className="mt-2 text-sm text-gray-600">
                    Note: {product.keterangan_harga_grosir}
                  </p>
                )}
              </div>

              {/* Harga Satuan */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Harga Satuan
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Minimum</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(product.harga_satuan_min)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-gray-500">Maksimum</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(product.harga_satuan_max)}
                    </p>
                  </div>
                </div>
                {product.keterangan_harga_satuan && (
                  <p className="mt-2 text-sm text-gray-600">
                    Note: {product.keterangan_harga_satuan}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Metadata</h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Dibuat Pada
                  </dt>
                  <dd className="mt-1">{formatDate(product.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Diperbarui Pada
                  </dt>
                  <dd className="mt-1">{formatDate(product.updated_at)}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
