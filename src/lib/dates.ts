import { format, addDays, differenceInDays, parseISO } from 'date-fns'

export function getDatesInRange(start: string, end: string): string[] {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  const days = differenceInDays(endDate, startDate)
  return Array.from({ length: days + 1 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'))
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date()
  const start = addDays(end, -30)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}
