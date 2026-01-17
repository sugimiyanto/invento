'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: ('admin' | 'readonly' | 'pending')[];
    fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = '/' }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && !allowedRoles.includes(user.role)) {
            router.push(fallbackPath);
        }
    }, [user, isLoading, allowedRoles, router, fallbackPath]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (user && allowedRoles.includes(user.role)) {
        return <>{children}</>;
    }

    return null;
}
