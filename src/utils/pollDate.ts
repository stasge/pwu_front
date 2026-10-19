/**
 * Дати опитувань сервер віддає як "Oct 15, 2026, 4:27:05 PM" (час сервера, без часового поясу),
 * інколи з вузьким нерозривним пробілом (U+202F) перед AM/PM.
 */
export function parsePollDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value.replace(/[  ]/g, ' '));
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** dd.MM.yyyy HH:mm — показуємо як є, у часі сервера */
export function formatPollDate(value?: string | null): string {
  const date = parsePollDate(value);
  if (!date) return '—';
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Для <input type="datetime-local">: yyyy-MM-ddTHH:mm */
export function pollDateToInput(value?: string | null): string {
  const date = parsePollDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** З <input type="datetime-local"> у формат запиту "yyyy-MM-dd HH:mm:ss" */
export function inputToPollDate(value: string): string | null {
  if (!value) return null;
  const [date, time = '00:00'] = value.split('T');
  const [h = '00', m = '00', s = '00'] = time.split(':');
  return `${date} ${h}:${m}:${s}`;
}
