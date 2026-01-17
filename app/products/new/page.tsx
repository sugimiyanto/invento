'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductForm } from '@/components/products/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';
import { createProduct } from '@/lib/hooks/useProducts';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      await createProduct(data);
      toast.success('Barang berhasil ditambahkan!');
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Gagal menambahkan barang. Silakan coba lagi.');
    }
  };

  const handleCancel = () => {
    router.push('/products');
  };

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Tambah Barang Baru</h2>
              <p className="text-gray-600 mt-1">
                Isi form di bawah untuk menambahkan barang baru
              </p>
            </div>
          </div>

          <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
