'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { importProducts, useProducts } from '@/lib/hooks/useProducts';

export default function ImportCSVPage() {
  const router = useRouter();
  const { products } = useProducts();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const existingKodes = new Set(products.map(p => p.kode_barang_baru));
          const validatedData = results.data.map((row: any) => {
            let error = '';
            let valid = true;

            if (!row.kode_barang_baru) {
              valid = false;
              error = 'Kode Barang Baru wajib diisi';
            } else if (existingKodes.has(row.kode_barang_baru)) {
              valid = false;
              error = 'Kode Barang Baru sudah ada di sistem';
            }

            if (!row.nama_barang) {
              valid = false;
              error = error ? `${error}, Nama Barang wajib diisi` : 'Nama Barang wajib diisi';
            }

            return {
              ...row,
              valid,
              error,
              harga_grosir_min: row.harga_grosir_min ? parseFloat(row.harga_grosir_min) : null,
              harga_grosir_max: row.harga_grosir_max ? parseFloat(row.harga_grosir_max) : null,
              harga_satuan_min: row.harga_satuan_min ? parseFloat(row.harga_satuan_min) : null,
              harga_satuan_max: row.harga_satuan_max ? parseFloat(row.harga_satuan_max) : null,
              stock: row.stock ? parseInt(row.stock) : 0,
              nomor_data: row.nomor_data ? parseInt(row.nomor_data) : null,
            };
          });
          setPreview(validatedData);
          if (validatedData.length === 0) {
            toast.error('File CSV kosong atau tidak valid.');
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Gagal membaca file CSV.');
        }
      });
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    const validProducts = preview.filter((p) => p.valid).map(({ valid, error, ...data }) => data);

    if (validProducts.length === 0) {
      toast.error('Tidak ada data valid yang bisa diimport.');
      return;
    }

    try {
      setImporting(true);
      setProgress(0);

      const chunkSize = 50;
      const total = validProducts.length;
      let importedCount = 0;

      // Import in chunks to show progress
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = validProducts.slice(i, i + chunkSize);
        await importProducts(chunk);
        importedCount += chunk.length;
        setProgress(Math.round((importedCount / total) * 100));
      }

      toast.success(
        `Berhasil mengimport ${validProducts.length} barang!`
      );
      router.push('/products');
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Gagal mengimport barang. Silakan cek format CSV Anda.');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `kode_barang_lama,kode_barang_baru,keterangan,nomor_data,nama_barang,harga_grosir_min,harga_grosir_max,keterangan_harga_grosir,harga_satuan_min,harga_satuan_max,keterangan_harga_satuan,stock,category
J005,J006,,1,ANTIMO SIRSAK GOLDEN CAIR 30 M2,3000,3200,,3500,3700,,100,Obat
J008,J009,,2,ANTIMO SIRSAK GOLDEN CAIR 60 M,5000,5200,,5500,5700,,50,Obat`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_invento.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template berhasil diunduh!');
  };

  const validCount = preview.filter(p => p.valid).length;
  const invalidCount = preview.filter(p => !p.valid).length;

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
              <h2 className="text-3xl font-bold">Import Barang dari CSV</h2>
              <p className="text-gray-600 mt-1">
                Upload file CSV untuk mengimport banyak barang sekaligus
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              {/* Step 1: Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Upload File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-gray-400 transition-colors cursor-pointer" onClick={() => document.getElementById('csv-upload')?.click()}>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-xs text-center text-gray-600">
                      Klik atau seret file CSV ke sini
                    </p>
                    <input
                      type="file"
                      id="csv-upload"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded text-xs truncate">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={downloadTemplate}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Template
                  </Button>
                </CardContent>
              </Card>

              {preview.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Total Baris:</span>
                      <span className="font-bold">{preview.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600 font-medium">Siap Import:</span>
                      <span className="font-bold">{validCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-red-600 font-medium">Bermasalah:</span>
                      <span className="font-bold">{invalidCount}</span>
                    </div>

                    {importing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Proses Mengimport...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleImport}
                      disabled={importing || validCount === 0}
                    >
                      {importing ? `Mengimport (${progress}%)` : `Import ${validCount} Barang`}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="md:col-span-2">
              {/* Step 2: Preview */}
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>2. Pratinjau & Validasi</CardTitle>
                </CardHeader>
                <CardContent>
                  {preview.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic text-sm">
                      <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                      <p>Silakan upload file untuk melihat pratinjau</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {preview.map((row, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${row.valid
                            ? 'bg-white border-gray-200'
                            : 'bg-red-50 border-red-200'
                            }`}
                        >
                          {row.valid ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {row.kode_barang_baru || '??'} - {row.nama_barang || 'Tanpa Nama'}
                            </p>
                            {row.error && (
                              <p className="text-xs text-red-600 mt-0.5">{row.error}</p>
                            )}
                            <div className="flex gap-4 mt-1 text-[10px] text-gray-500">
                              <span>Stok: {row.stock}</span>
                              <span>Kategori: {row.category || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
