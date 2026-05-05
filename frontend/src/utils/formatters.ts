import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export function formatDate(
  ts: Timestamp | null | undefined,
  fmt = 'MMM d, yyyy',
): string {
  if (!ts) return 'N/A';
  try {
    return format(ts.toDate(), fmt);
  } catch {
    return 'N/A';
  }
}

export function formatStatus(status: string | null | undefined): string {
  return (status ?? 'pending').replace(/_/g, ' ');
}

export function statusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'delivered':  return 'bg-[#d2e4fb] text-[#0b1d2d]';
    case 'in_transit': return 'bg-[#78f7e8] text-[#00201d]';
    default:           return 'bg-[#ebeeed] text-[#4f6073]';
  }
}

export function getProgressFromStatus(status: string | null | undefined): number {
  switch (status) {
    case 'delivered':  return 100;
    case 'in_transit': return 60;
    default:           return 30;
  }
}
