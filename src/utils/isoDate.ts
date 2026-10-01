const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

const pad = (value: number) => String(value).padStart(2, '0')

/** Локальна дата → 'yyyy-MM-dd' */
export const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** 'yyyy-MM-dd' → локальна дата, або null для порожнього / некоректного значення */
export const parseIsoDate = (value: string): Date | null => {
    const match = ISO_DATE_REGEX.exec(value)
    if (!match) return null
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return toIsoDate(date) === value ? date : null
}

/** 'yyyy-MM-dd' → 'dd.MM.yy' */
export const formatShortDate = (value: string) => {
    const match = ISO_DATE_REGEX.exec(value)
    return match ? `${match[3]}.${match[2]}.${match[1].slice(2)}` : ''
}
