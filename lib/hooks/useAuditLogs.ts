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

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err as Error);
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
