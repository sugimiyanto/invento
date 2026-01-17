'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Beranda', href: '/', icon: Home },
    { name: 'Barang', href: '/products', icon: Package },
    ...(user?.role === 'admin'
      ? [{ name: 'Pengguna', href: '/users', icon: Users }]
      : []),
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-6 text-center">
        <h1 className="text-xl font-bold">Invento H. Ulum</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-800 p-4">
        <div className="mb-3 space-y-1">
          <p className="text-sm font-medium">{user?.full_name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <Badge
            variant={user?.role === 'admin' ? 'default' : 'secondary'}
            className="mt-1"
          >
            {user?.role === 'admin' ? 'Admin' : 'Lihat Saja'}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
}
