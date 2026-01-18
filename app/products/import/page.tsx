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
  const [importStrategy, setImportStrategy] = useState<'skip' | 'replace'>('skip');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const existingKodes = new Set(products.map(p => p.kode_barang_baru));
          const csvKodes = new Set(); // Track kodes within the CSV to detect duplicates

          const validatedData = results.data.map((row: any) => {
            let error = '';
            let valid = true;
            let isDuplicate = false;

            if (!row.kode_barang_baru) {
              valid = false;
              error = 'Kode Barang Baru wajib diisi';
            } else if (existingKodes.has(row.kode_barang_baru)) {
              isDuplicate = true;
              valid = true; // Mark as valid, will handle based on strategy
              error = 'Barang sudah ada di database (akan di-skip atau timpa)';
            } else if (csvKodes.has(row.kode_barang_baru)) {
              // Duplicate within CSV itself
              isDuplicate = true;
              valid = true;
              error = 'Duplikat di dalam CSV (akan di-skip atau timpa)';
            } else {
              // First occurrence, add to set
              csvKodes.add(row.kode_barang_baru);
            }

            if (!row.nama_barang) {
              valid = false;
              error = error ? `${error}, Nama Barang wajib diisi` : 'Nama Barang wajib diisi';
            }

            const cleanNumber = (val: any) => {
              if (val === undefined || val === null || val === '') return null;
              const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
              return isNaN(num) ? null : num;
            };

            const cleanInt = (val: any) => {
              if (val === undefined || val === null || val === '') return 0;
              const num = parseInt(String(val).replace(/[^0-9-]+/g, ""));
              return isNaN(num) ? 0 : num;
            };

            return {
              kode_barang_lama: row.kode_barang_lama || null,
              kode_barang_baru: row.kode_barang_baru,
              keterangan: row.keterangan || null,
              nomor_data: cleanNumber(row.nomor_data),
              nama_barang: row.nama_barang,
              harga_grosir_min: cleanNumber(row.harga_grosir_min),
              harga_grosir_max: cleanNumber(row.harga_grosir_max),
              keterangan_harga_grosir: row.keterangan_harga_grosir || null,
              harga_satuan_min: cleanNumber(row.harga_satuan_min),
              harga_satuan_max: cleanNumber(row.harga_satuan_max),
              keterangan_harga_satuan: row.keterangan_harga_satuan || null,
              stock: cleanInt(row.stock),
              category: row.category || null,
              valid,
              error,
              isDuplicate,
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

    // Filter based on strategy
    let validProducts = preview.filter((p) => p.valid);

    if (importStrategy === 'skip') {
      // Remove duplicates when skipping
      validProducts = validProducts.filter((p) => !p.isDuplicate);
    }
    // If 'replace', include everything (duplicates will be updated)

    validProducts = validProducts.map(({ valid, error, isDuplicate, ...data }) => data);

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
        await importProducts(chunk, importStrategy);
        importedCount += chunk.length;
        setProgress(Math.round((importedCount / total) * 100));
      }

      toast.success(
        `Berhasil mengimport ${validProducts.length} barang!`
      );
      router.push('/products');
    } catch (error: any) {
      console.error('Error importing products:', error);
      toast.error(`Gagal mengimport: ${error.message || 'Cek format CSV Anda'}`);
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
                    <CardTitle>Ringkasan & Opsi</CardTitle>
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

                    {preview.some(p => p.isDuplicate) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Pilih cara menangani data yang sudah ada:
                        </p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: importStrategy === 'skip' ? '#3b82f6' : undefined, backgroundColor: importStrategy === 'skip' ? '#eff6ff' : undefined }}>
                            <input
                              type="radio"
                              name="strategy"
                              value="skip"
                              checked={importStrategy === 'skip'}
                              onChange={(e) => setImportStrategy(e.target.value as 'skip' | 'replace')}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">Skip (Abaikan)</p>
                              <p className="text-xs text-gray-500">Jika data sudah ada, akan dilewati</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: importStrategy === 'replace' ? '#3b82f6' : undefined, backgroundColor: importStrategy === 'replace' ? '#eff6ff' : undefined }}>
                            <input
                              type="radio"
                              name="strategy"
                              value="replace"
                              checked={importStrategy === 'replace'}
                              onChange={(e) => setImportStrategy(e.target.value as 'skip' | 'replace')}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">Timpa (Replace)</p>
                              <p className="text-xs text-gray-500">Jika data sudah ada, akan diperbarui</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

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
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${!row.valid
                            ? 'bg-red-50 border-red-200'
                            : row.isDuplicate
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-white border-gray-200'
                            }`}
                        >
                          {!row.valid ? (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          ) : row.isDuplicate ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {row.kode_barang_baru || '??'} - {row.nama_barang || 'Tanpa Nama'}
                            </p>
                            {row.error && (
                              <p className={`text-xs mt-0.5 ${row.isDuplicate ? 'text-yellow-600' : 'text-red-600'}`}>
                                {row.error}
                                {row.isDuplicate && importStrategy === 'replace' && ' (akan diperbarui)'}
                                {row.isDuplicate && importStrategy === 'skip' && ' (akan dilewati)'}
                              </p>
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
