'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertCircle, DollarSign, Plus, Upload, History } from 'lucide-react';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAuditLogs } from '@/lib/hooks/useAuditLogs';
import { formatCurrency } from '@/lib/utils/format';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { products, isLoading: isProductsLoading } = useProducts();
  const { logs, isLoading: isLogsLoading } = useAuditLogs(5);

  // Calculate stats dari products data
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock < 20).length;
  const totalValue = products.reduce((sum, p) => {
    const price = p.harga_satuan_max || p.harga_satuan_min || 0;
    return sum + price * p.stock;
  }, 0);

  if (user?.role === 'readonly') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Selamat Datang, {user?.full_name}!</h2>
            <p className="text-gray-600 mt-1">Cari barang di bawah ini</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Pencarian Cepat */}
            <Card>
              <CardHeader>
                <CardTitle>Mulai Mencari</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/products">
                  <Button size="lg" className="w-full">
                    <Package className="mr-2 h-5 w-5" />
                    Lihat Semua Barang
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
                <Package className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-gray-600">tersedia di katalog</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin Dashboard
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Barang
              </CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-gray-600 mt-1">barang di inventori</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStock}</div>
              <p className="text-xs text-gray-600 mt-1">barang di bawah 20 unit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Nilai
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-gray-600 mt-1">estimasi nilai inventori</p>
            </CardContent>
          </Card>
        </div>

        {/* Aksi Cepat */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/products/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Barang
              </Button>
            </Link>
            <Link href="/products/import">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </Link>
            <Link href="/users">
              <Button variant="outline">
                Kelola Pengguna
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Aktivitas Terkini */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Aktivitas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLogsLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
                <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Belum ada aktivitas tercatat.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${log.action === 'create' ? 'bg-green-500' :
                      log.action === 'update' ? 'bg-blue-500' :
                        log.action === 'delete' ? 'bg-red-500' :
                          'bg-purple-500'
                      }`} />
                    <div className="flex-1">
                      <p className="text-gray-700">
                        <span className="font-semibold">{log.profiles?.full_name || log.profiles?.email || 'System'}</span>
                        {' '}
                        {log.action === 'create' ? 'menambahkan' :
                          log.action === 'update' ? 'mengubah' :
                            log.action === 'delete' ? 'menghapus' :
                              'mengimpor'}
                        {' '}
                        {log.table_name === 'products' ? 'barang' : log.table_name}
                        {log.changes?.nama_barang && ` "${log.changes.nama_barang}"`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
