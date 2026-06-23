/** Українські форми: 1 — one, 2–4 — few, інше — many (11–14 → many). */
export function ukPlural(count: number, one: string, few: string, many: string): string {
    const abs = Math.abs(count) % 100;
    const rem10 = abs % 10;
    if (abs > 10 && abs < 20) return many;
    if (rem10 > 1 && rem10 < 5) return few;
    if (rem10 === 1) return one;
    return many;
}

export function getCalendarElapsed(start: Date, end: Date) {
    if (end.getTime() < start.getTime()) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0 };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    let hours = end.getHours() - start.getHours();
    let minutes = end.getMinutes() - start.getMinutes();

    if (minutes < 0) {
        hours -= 1;
        minutes += 60;
    }
    if (hours < 0) {
        days -= 1;
        hours += 24;
    }
    if (days < 0) {
        months -= 1;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months, days, hours, minutes };
}

/** Сервер віддає UTC без позначки часового поясу (наприклад, "2026-05-29 12:00:00"). */
export function parseServerDateTime(value: string | Date): Date {
    if (value instanceof Date) return value;
    const normalized = String(value).trim();
    if (!normalized) return new Date(NaN);
    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(normalized)) {
        return new Date(normalized);
    }
    const iso = normalized.includes('T') ? normalized : normalized.replace(' ', 'T');
    return new Date(`${iso}Z`);
}

function getKyivDateParts(date: Date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Kyiv',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value ?? '';
    return { day: part('day'), month: part('month'), year: part('year') };
}

/** Формат dd/MM/yyyy у часовому поясі Києва. */
export function formatKyivDate(value: string | Date): string {
    const date = parseServerDateTime(value);
    if (Number.isNaN(date.getTime())) return '';
    const { day, month, year } = getKyivDateParts(date);
    return `${day}/${month}/${year}`;
}

/** Формат dd.MM.yyyy HH:mm у часовому поясі Києва. */
export function formatKyivDateTime(value: string | Date): string {
    const date = parseServerDateTime(value);
    if (Number.isNaN(date.getTime())) return '';
    const { day, month, year } = getKyivDateParts(date);
    const timeParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        timeParts.find((p) => p.type === type)?.value ?? '';
    return `${day}.${month}.${year} ${part('hour')}:${part('minute')}`;
}

export function calculateTimeLeft(targetDate: string) {
    const targetDateTime = new Date(targetDate).getTime();
    const currentDateTime = new Date().getTime();
    
    let difference = targetDateTime - currentDateTime;
  
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0
      };
    }
  
    let days = Math.floor(difference / (1000 * 60 * 60 * 24));
    difference -= days * (1000 * 60 * 60 * 24);
  
    let hours = Math.floor(difference / (1000 * 60 * 60));
  
    return days > 0 ? `${days} днів` : hours > 0 ? `${hours} годин` : '-' 
  }