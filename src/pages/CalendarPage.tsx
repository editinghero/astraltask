import { useMemo, useState } from 'react';
import { Calendar as Cal } from '@/components/ui/calendar';
import { useTasks, Task } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import TaskEditor from '@/components/TaskEditor';
import { dateKey, taskCoversDay } from '@/lib/date';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { tasks, toggle } = useTasks();
  const [selected, setSelected] = useState<Date>(new Date());
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);

  const taskDates = useMemo(() => {
    const set = new Set<string>();
    tasks.filter(t => !t.parent_id).forEach(t => {
      const start = new Date(t.scheduled_date + 'T00:00:00');
      const end = t.end_date ? new Date(t.end_date + 'T00:00:00') : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(dateKey(d));
      }
    });
    return Array.from(set).map(s => new Date(s + 'T00:00:00'));
  }, [tasks]);

  const dayTasks = useMemo(() => {
    return tasks.filter(t => !t.parent_id && taskCoversDay(t.scheduled_date, t.end_date, selected));
  }, [tasks, selected]);

  return (
    <div className="px-4 pt-3 space-y-4">
      <header className="px-1 animate-fade-up">
        <h1 className="text-2xl font-display">Calendar</h1>
        <p className="text-xs text-muted-foreground">Pick any date — past or future.</p>
      </header>

      <div className="glass glow-border rounded-2xl p-1.5 flex justify-center">
        <Cal
          mode="single"
          selected={selected}
          onSelect={d => d && setSelected(d)}
          modifiers={{ hasTask: taskDates }}
          modifiersClassNames={{ hasTask: 'has-task-day' }}
          className={cn("p-2 pointer-events-auto")}
          classNames={{
            months: "flex flex-col",
            month: "space-y-2",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-[13px] font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-transparent p-0 opacity-60 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-muted",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[10px] uppercase",
            row: "flex w-full mt-1",
            cell: "h-8 w-9 text-center text-[13px] p-0 relative",
            day: "h-8 w-8 mx-auto p-0 font-normal rounded-lg hover:bg-muted aria-selected:opacity-100",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day_today: "border border-primary/40 font-semibold",
            day_outside: "text-muted-foreground opacity-40",
            day_disabled: "text-muted-foreground opacity-40",
            day_hidden: "invisible",
          }}
        />
        <style>{`
          .has-task-day { font-weight: 600; }
          .has-task-day::after {
            content: ''; display: block; width: 3px; height: 3px;
            border-radius: 9999px; background: hsl(var(--foreground) / 0.65);
            margin: 0 auto;
          }
        `}</style>
      </div>

      <section>
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-[15px] font-semibold">{format(selected, 'EEEE, MMM d')}</h2>
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 pressable h-8">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
        {dayTasks.length === 0 ? (
          <div className="glass glow-border rounded-2xl px-4 py-5 text-center text-[13px] text-muted-foreground">
            No tasks for this day.
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(t => (
              <TaskCard 
                key={t.id} 
                task={t} 
                subtasks={tasks.filter(s => s.parent_id === t.id)} 
                onToggle={toggle.mutate} 
                onClick={(task) => {
                  if (!task.parent_id) {
                    setEditing(task);
                  }
                }} 
              />
            ))}
          </div>
        )}
      </section>

      <TaskEditor open={!!editing} onOpenChange={(o) => !o && setEditing(null)} task={editing} />
      <TaskEditor open={creating} onOpenChange={setCreating} initialDate={selected} />
    </div>
  );
}
