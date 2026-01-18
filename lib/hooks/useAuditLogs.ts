import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete' | 'import';
  table_name: string;
  record_id: string;
  changes: any;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export function useAuditLogs(limit = 10) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        // Jika error karena table tidak ada atau permission, set empty array
        console.warn('Audit logs tidak tersedia:', error.message);
        setLogs([]);
        setError(null); // Jangan set error, biarkan app berjalan normal
      } else {
        setLogs(data || []);
        setError(null);
      }
    } catch (err: any) {
      // Ignore abort errors from HMR
      if (err?.name === 'AbortError') {
        console.log('Audit logs fetch aborted (likely HMR)');
      } else {
        console.warn('Error fetching audit logs:', err);
      }
      setLogs([]); // Set empty array, jangan crash app
      setError(null); // Jangan set error, biarkan app berjalan normal
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  return { logs, isLoading, error, refetch: fetchLogs };
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { error } = await supabase.from('audit_logs').insert(log);
  if (error) {
    console.error('Error creating audit log:', error);
    // Kita tidak throw error di sini agar aksi utamanya (misal delete product) tidak gagal cuma gara-gara log gagal
  }
}
