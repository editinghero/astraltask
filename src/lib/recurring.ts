import { Task } from '@/hooks/useTasks';
import { addDays, addWeeks, addMonths, addYears, parseISO, isBefore, isAfter } from 'date-fns';

export function getNextRecurringDate(
  currentDate: string,
  recurringType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number = 1
): string {
  const date = parseISO(currentDate);
  
  switch (recurringType) {
    case 'daily':
      return addDays(date, interval).toISOString().split('T')[0];
    case 'weekly':
      return addWeeks(date, interval).toISOString().split('T')[0];
    case 'monthly':
      return addMonths(date, interval).toISOString().split('T')[0];
    case 'yearly':
      return addYears(date, interval).toISOString().split('T')[0];
    default:
      return currentDate;
  }
}

export function shouldCreateNextRecurrence(task: Task): boolean {
  if (!task.recurring_type || !task.completed) {
    return false;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const taskDate = task.scheduled_date;
  
  // Only create next occurrence if task is completed and date has passed
  if (!isBefore(parseISO(taskDate), parseISO(today))) {
    return false;
  }
  
  // Check if we've reached the end date
  if (task.recurring_end_date) {
    const nextDate = getNextRecurringDate(
      taskDate,
      task.recurring_type,
      task.recurring_interval || 1
    );
    
    if (isAfter(parseISO(nextDate), parseISO(task.recurring_end_date))) {
      return false;
    }
  }
  
  return true;
}

export function createNextRecurrence(task: Task): Omit<Task, 'id' | 'created_at' | 'updated_at'> {
  const nextDate = getNextRecurringDate(
    task.scheduled_date,
    task.recurring_type!,
    task.recurring_interval || 1
  );
  
  return {
    ...task,
    scheduled_date: nextDate,
    completed: false,
    notify_at: null, // Reset notification
  };
}

export function getRecurringDescription(
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | null,
  interval: number | null
): string {
  if (!type) return 'Does not repeat';
  
  const intervalNum = interval || 1;
  
  if (intervalNum === 1) {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
    }
  }
  
  switch (type) {
    case 'daily': return `Every ${intervalNum} days`;
    case 'weekly': return `Every ${intervalNum} weeks`;
    case 'monthly': return `Every ${intervalNum} months`;
    case 'yearly': return `Every ${intervalNum} years`;
    default: return 'Does not repeat';
  }
}
