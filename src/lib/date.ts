import { format, startOfWeek, addDays, isToday, isSameDay, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';

export const dateKey = (d: Date) => format(d, 'yyyy-MM-dd');

export function getWeek(start: Date): Date[] {
  const monday = startOfWeek(start, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Does a task with [scheduled_date, end_date?] cover the given day? */
export function taskCoversDay(scheduled_date: string, end_date: string | null | undefined, day: Date): boolean {
  const start = parseISO(scheduled_date);
  const end = end_date ? parseISO(end_date) : start;
  const d = startOfDay(day);
  return !isBefore(d, startOfDay(start)) && !isAfter(d, startOfDay(end));
}

export { format, addDays, isToday, isSameDay, parseISO, isBefore, isAfter, startOfDay };
