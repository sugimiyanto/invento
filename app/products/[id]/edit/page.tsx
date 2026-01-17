'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductForm } from '@/components/products/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';
import { useProduct, updateProduct } from '@/lib/hooks/useProducts';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { product, isLoading } = useProduct(params.id as string);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data barang...</p>
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
            Barang yang ingin Anda ubah tidak ditemukan.
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

  const handleSubmit = async (data: any) => {
    if (!product) return;

    try {
      await updateProduct(product.id, data);
      toast.success('Barang berhasil diperbarui!');
      router.push(`/products/${product.id}`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Gagal memperbarui barang. Silakan coba lagi.');
    }
  };

  const handleCancel = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Ubah Barang</h2>
              <p className="text-gray-600 mt-1">{product.nama_barang}</p>
            </div>
          </div>

          <ProductForm
            product={product}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
