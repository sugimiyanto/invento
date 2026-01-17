'use client';

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    if (pathname === '/') return 'Beranda';
    if (pathname === '/products') return 'Daftar Barang';
    if (pathname === '/products/new') return 'Barang / Tambah Baru';
    if (pathname === '/products/import') return 'Barang / Import CSV';
    if (pathname.startsWith('/products/') && pathname.endsWith('/edit'))
      return 'Barang / Edit';
    if (pathname.startsWith('/products/')) return 'Barang / Detail';
    if (pathname === '/users') return 'Kelola Pengguna';
    return 'Invento';
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        {getBreadcrumbs()}
      </h1>
    </div>
  );
}
