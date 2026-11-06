// Formatacao pt-BR sem depender de Intl (funciona em qualquer engine JS).

export function formatNumber(value, digits = 0) {
  if (value == null || Number.isNaN(value)) return '--';
  const fixed = Math.abs(value).toFixed(digits);
  const [int, dec] = fixed.split('.');
  const intWithDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}${intWithDots}${dec ? `,${dec}` : ''}`;
}

export const formatPercent = (value, digits = 0) => `${formatNumber(value * 100, digits)}%`;

export const formatSigned = (value, digits = 1) => `${value > 0 ? '+' : ''}${formatNumber(value, digits)}`;

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** '2026-11-05' -> '05/11' */
export function formatShortDate(isoDate) {
  const [, m, d] = isoDate.slice(0, 10).split('-');
  return `${d}/${m}`;
}

/** '2026-11-05' -> 'qui, 05/11' */
export function formatWeekdayDate(isoDate) {
  const dow = new Date(`${isoDate.slice(0, 10)}T12:00:00`).getDay();
  return `${WEEKDAYS[dow]}, ${formatShortDate(isoDate)}`;
}

/** ISO datetime -> '05/11 às 14:32' */
export function formatDateTime(iso) {
  if (!iso) return '--';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
