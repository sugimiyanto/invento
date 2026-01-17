'use client';

import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Clock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Redirect jika bukan pending user
  useEffect(() => {
    if (user && user.role !== 'pending') {
      router.push('/');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
            <CardDescription className="text-base mt-2">
              Akun Anda sedang dalam proses verifikasi
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Akun Anda Terdaftar</p>
                <p className="text-sm text-blue-700 mt-1">
                  Email: <span className="font-mono">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Langkah Selanjutnya</p>
                <p className="text-sm text-blue-700 mt-1">
                  Hubungi administrator untuk mendapatkan akses ke Invento H. Ulum.
                  Admin akan mengaktifkan akun Anda dalam waktu dekat.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">
              Anda akan mendapat akses setelah admin menyetujui permintaan Anda.
              Silakan refresh halaman ini secara berkala atau logout dan login kembali.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              Refresh Status
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full"
              variant="ghost"
            >
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
