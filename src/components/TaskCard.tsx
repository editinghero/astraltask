import { Task } from '@/hooks/useTasks';
import { Check, Clock, Bell, FileText, CalendarRange, Pin, Tag, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';

interface Props {
  task: Task;
  subtasks?: Task[];
  onToggle: (t: Task) => void;
  onClick: (t: Task) => void;
  compact?: boolean;
}

const priorityRing: Record<string, string> = {
  low: 'border-foreground/20',
  medium: 'border-foreground/35',
  high: 'border-destructive/70',
};

export default function TaskCard({ task, subtasks = [], onToggle, onClick, compact }: Props) {
  const [expanded, setExpanded] = useState(false);
  const completedSubs = subtasks.filter(s => s.completed).length;
  const timeLabel = task.start_time
    ? task.end_time
      ? `${task.start_time.slice(0,5)} – ${task.end_time.slice(0,5)}`
      : task.start_time.slice(0,5)
    : null;
  const rangeLabel = task.end_date && task.end_date !== task.scheduled_date
    ? `${format(parseISO(task.scheduled_date), 'MMM d')} – ${format(parseISO(task.end_date), 'MMM d')}`
    : null;

  return (
    <div
      className={cn(
        'glass glow-border rounded-2xl animate-fade-up',
        task.pinned && 'glow-border-strong',
        task.completed && 'opacity-55'
      )}
    >
      <div
        onClick={() => onClick(task)}
        className="px-3.5 py-3 cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(task); }}
            aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            className={cn(
              'mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center pressable focus-ring',
              task.completed
                ? 'bg-foreground border-foreground'
                : `${priorityRing[task.priority] ?? priorityRing.medium} hover:border-foreground`
            )}
          >
            {task.completed && <Check className="w-3 h-3 text-background" strokeWidth={4} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              {task.pinned && <Pin className="w-3 h-3 mt-1 shrink-0 fill-foreground/70 text-foreground/70" />}
              <h3 className={cn('font-medium text-[15px] leading-snug', task.completed && 'line-through')}>
                {task.title}
              </h3>
            </div>

            {!compact && task.notes && (
              <p className="text-[12.5px] text-muted-foreground mt-0.5 line-clamp-2">{task.notes}</p>
            )}

            {(timeLabel || rangeLabel || subtasks.length > 0 || task.notify_enabled || task.priority === 'high' || (task.tags?.length ?? 0) > 0 || (task.notes && compact)) && (
              <div className="flex items-center flex-wrap gap-1.5 mt-2">
                {timeLabel && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-foreground/15 bg-foreground/[0.04]">
                    <Clock className="w-3 h-3" /> {timeLabel}
                  </span>
                )}
                {rangeLabel && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-foreground/15 bg-foreground/[0.04] text-muted-foreground">
                    <CalendarRange className="w-3 h-3" /> {rangeLabel}
                  </span>
                )}
                {subtasks.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-foreground/15 bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08] pressable"
                  >
                    <ChevronRight className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')} />
                    {completedSubs}/{subtasks.length}
                  </button>
                )}
                {(task.tags ?? []).slice(0, 2).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border border-foreground/15 bg-foreground/[0.04] text-muted-foreground">
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </span>
                ))}
                {task.notify_enabled && (
                  <span className="inline-flex items-center text-muted-foreground">
                    <Bell className="w-3 h-3" />
                  </span>
                )}
                {task.notes && compact && (
                  <FileText className="w-3 h-3 text-muted-foreground" />
                )}
                {task.priority === 'high' && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-destructive/40 text-destructive">High</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Subtasks Section */}
      {expanded && subtasks.length > 0 && (
        <div className="px-3.5 pb-3 space-y-1.5 border-t border-foreground/5 pt-2">
          {subtasks.map(subtask => {
            return (
              <div
                key={subtask.id}
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(subtask); }}
                  aria-label={subtask.completed ? 'Mark incomplete' : 'Mark complete'}
                  className={cn(
                    'mt-0.5 shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center pressable focus-ring',
                    subtask.completed
                      ? 'bg-foreground border-foreground'
                      : 'border-foreground/25 hover:border-foreground'
                  )}
                >
                  {subtask.completed && <Check className="w-2.5 h-2.5 text-background" strokeWidth={4} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[13px] leading-snug', subtask.completed && 'line-through opacity-60')}>
                    {subtask.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
