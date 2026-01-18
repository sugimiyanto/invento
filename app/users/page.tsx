'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/auth/role-guard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import { useUsers, updateUserRole, deleteUser } from '@/lib/hooks/useUsers';
import { useAuth } from '@/lib/context/auth-context';
import { toast } from 'sonner';

export default function UsersPage() {
  const { users, isLoading, refetch } = useUsers();
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'readonly' | 'pending'>('readonly');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      setIsSaving(true);
      await updateUserRole(editingUser.id, selectedRole);
      const roleLabel = selectedRole === 'admin' ? 'Admin' : selectedRole === 'readonly' ? 'Lihat Saja' : 'Menunggu Persetujuan';
      toast.success(`Peran pengguna berhasil diubah menjadi ${roleLabel}`);
      setEditingUser(null);
      refetch();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Gagal mengubah peran pengguna. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickApprove = async (user: any) => {
    try {
      setIsSaving(true);
      await updateUserRole(user.id, 'readonly');
      toast.success(`${user.email} telah disetujui dan dapat mengakses sistem!`);
      refetch();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Gagal menyetujui pengguna. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akses ${user.email}? Pengguna akan kehilangan akses dan harus mendaftar ulang.`)) {
      return;
    }

    try {
      setIsDeleting(user.id);
      const { error } = await deleteUser(user.id);

      if (error) throw error;

      toast.success(`Data akses untuk ${user.email} berhasil dihapus.`);
      await refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(`Gagal menghapus pengguna: ${error.message || 'Error tidak diketahui'}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold">Kelola Pengguna</h2>
            <p className="text-gray-600 mt-1">
              Kelola peran dan izin pengguna
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Catatan:</strong> Pengguna harus masuk dengan Google terlebih dahulu
                  sebelum muncul di sini. Pengguna baru otomatis mendapat status "Menunggu Persetujuan"
                  dan harus disetujui oleh admin untuk dapat mengakses sistem.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Nama</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {user.full_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'admin' ? 'default' :
                              user.role === 'pending' ? 'destructive' :
                                'secondary'
                          }
                        >
                          {user.role === 'admin' ? 'Admin' :
                            user.role === 'pending' ? 'Menunggu Persetujuan' :
                              'Lihat Saja'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {user.role === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleQuickApprove(user)}
                              disabled={isSaving || isDeleting === user.id}
                              title="Setujui pengguna ini"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(user)}
                                disabled={isDeleting === user.id || isSaving}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ubah Peran Pengguna</DialogTitle>
                              <DialogDescription>
                                Ubah peran untuk {editingUser?.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="role">Peran</Label>
                                <select
                                  id="role"
                                  value={selectedRole}
                                  onChange={(e) =>
                                    setSelectedRole(e.target.value as any)
                                  }
                                  className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                                  disabled={isSaving}
                                >
                                  <option value="pending">Menunggu Persetujuan</option>
                                  <option value="readonly">Lihat Saja</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-600">
                                  <strong>Menunggu Persetujuan:</strong> User belum dapat mengakses sistem
                                  <br />
                                  <strong>Lihat Saja:</strong> Hanya dapat melihat dan mencari barang
                                  <br />
                                  <strong>Admin:</strong> Dapat mengelola barang, import CSV, dan mengelola pengguna
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                disabled={isSaving}
                              >
                                Batal
                              </Button>
                              <Button
                                onClick={handleUpdateRole}
                                disabled={isSaving}
                              >
                                {isSaving ? 'Menyimpan...' : 'Simpan'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                          {currentUser?.id !== user.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(user)}
                              disabled={isDeleting === user.id || isSaving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
