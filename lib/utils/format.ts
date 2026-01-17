import { format } from 'date-fns';

// Format currency to Indonesian Rupiah
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to readable format
export function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM yyyy HH:mm');
  } catch {
    return '-';
  }
}

// Format number with thousand separator
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '-';
  return new Intl.NumberFormat('id-ID').format(num);
}
