import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
  onWeekShift: (delta: number) => void;
  weekStart: Date;
  countByDate: Record<string, { total: number; done: number }>;
}

export default function WeekStrip({ selected, onSelect, onWeekShift, weekStart, countByDate }: Props) {
  const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = new Date();

  return (
    <div className="glass glow-border rounded-2xl p-2.5">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <button onClick={() => onWeekShift(-7)} aria-label="Previous week" className="p-1 rounded-lg hover:bg-muted pressable text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-semibold tracking-tight">{format(monday, 'MMMM yyyy')}</span>
        <button onClick={() => onWeekShift(7)} aria-label="Next week" className="p-1 rounded-lg hover:bg-muted pressable text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(d => {
          const k = format(d, 'yyyy-MM-dd');
          const isSelected = isSameDay(d, selected);
          const isTodayDay = isSameDay(d, today);
          const cnt = countByDate[k];
          return (
            <button
              key={k}
              onClick={() => onSelect(d)}
              className={cn(
                'flex flex-col items-center py-2 rounded-xl pressable transition-colors relative border',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isTodayDay
                    ? 'border-primary/40 text-foreground'
                    : 'border-transparent hover:bg-muted/60 text-foreground'
              )}
            >
              <span className={cn('text-[9px] uppercase tracking-wider font-medium opacity-70')}>{format(d, 'EEEEE')}</span>
              <span className={cn('text-[15px] font-semibold mt-0.5')}>{format(d, 'd')}</span>
              {cnt && cnt.total > 0 && (
                <span className={cn('absolute bottom-1 w-1 h-1 rounded-full',
                  isSelected ? 'bg-primary-foreground/80' : 'bg-primary/70')} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
