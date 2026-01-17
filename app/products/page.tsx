'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Search, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useProducts, deleteProduct } from '@/lib/hooks/useProducts';
import { formatCurrency } from '@/lib/utils/format';
import { Product } from '@/lib/types/product';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { user } = useAuth();
  const { products, isLoading, refetch } = useProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
        product.kode_barang_baru.toLowerCase().includes(search.toLowerCase()) ||
        product.kode_barang_lama?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDelete = async (product: Product) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${product.nama_barang}"?`)) {
      return;
    }

    try {
      setDeletingId(product.id);
      await deleteProduct(product.id);
      toast.success('Barang berhasil dihapus!');
      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Gagal menghapus barang. Silakan coba lagi.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat barang...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Barang-barang</h2>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} barang ditemukan
            </p>
          </div>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Link href="/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambahkan Barang
                </Button>
              </Link>
              <Link href="/products/import">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Impor Data Barang (CSV)
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama atau kode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Harga Grosir
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Harga Satuan
                    </TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Kategori
                    </TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-500">No barang ditemukan</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.kode_barang_baru}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium">{product.nama_barang}</div>
                          {product.kode_barang_lama && (
                            <div className="text-xs text-gray-500">
                              Old: {product.kode_barang_lama}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.harga_grosir_min && (
                            <div className="text-sm">
                              {formatCurrency(product.harga_grosir_min)} -{' '}
                              {formatCurrency(product.harga_grosir_max)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.harga_satuan_min && (
                            <div className="text-sm">
                              {formatCurrency(product.harga_satuan_min)} -{' '}
                              {formatCurrency(product.harga_satuan_max)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.stock < 20 ? 'destructive' : 'default'}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/products/${product.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {user?.role === 'admin' && (
                              <>
                                <Link href={`/products/${product.id}/edit`}>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(product)}
                                  disabled={deletingId === product.id}
                                >
                                  {deletingId === product.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600">
              Halaman {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
