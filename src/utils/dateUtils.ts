/**
 * Safe date utilities for inclusive calendar day calculations
 */

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatToISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysInclusive(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function getOverlapDays(
  billStartStr: string,
  billEndStr: string,
  moveInStr: string,
  moveOutStr: string | null
): {
  days: number;
  overlapStart: string;
  overlapEnd: string;
} {
  const billStart = parseLocalDate(billStartStr);
  const billEnd = parseLocalDate(billEndStr);
  const moveIn = parseLocalDate(moveInStr);
  const moveOut = moveOutStr ? parseLocalDate(moveOutStr) : null;

  // Actual start is latest of billStart and moveIn
  const effectiveStart = billStart > moveIn ? billStart : moveIn;

  // Actual end is earliest of billEnd and moveOut
  let effectiveEnd = billEnd;
  if (moveOut && moveOut < billEnd) {
    effectiveEnd = moveOut;
  }

  if (effectiveEnd < effectiveStart) {
    return { days: 0, overlapStart: '', overlapEnd: '' };
  }

  const days = Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return {
    days: Math.max(0, days),
    overlapStart: formatToISO(effectiveStart),
    overlapEnd: formatToISO(effectiveEnd),
  };
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatCurrency(amount: number, symbol: string = '₹'): string {
  const rounded = Math.round(amount);
  return `${symbol}${rounded.toLocaleString('en-IN')}`;
}
