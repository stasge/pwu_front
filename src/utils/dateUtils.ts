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