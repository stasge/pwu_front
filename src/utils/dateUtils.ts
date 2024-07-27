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