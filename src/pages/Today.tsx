import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, isSameDay, isToday } from 'date-fns';
import { useTasks, Task } from '@/hooks/useTasks';
import WeekStrip from '@/components/WeekStrip';
import TaskCard from '@/components/TaskCard';
import TaskEditor from '@/components/TaskEditor';
import SwipeableTask from '@/components/SwipeableTask';
import TaskFilters, { DEFAULT_FILTERS, FilterState } from '@/components/TaskFilters';
import { dateKey, taskCoversDay } from '@/lib/date';
import { useAuth } from '@/providers/AuthProvider';
import { Plus, Flame, CheckCircle2, Pin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function Today() {
  const { user } = useAuth();
  const { tasks, toggle, remove } = useTasks();
  const [selected, setSelected] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const countByDate = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    tasks.filter(t => !t.parent_id).forEach(t => {
      const start = new Date(t.scheduled_date + 'T00:00:00');
      const end = t.end_date ? new Date(t.end_date + 'T00:00:00') : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const k = dateKey(d);
        if (!map[k]) map[k] = { total: 0, done: 0 };
        map[k].total++;
        if (t.completed) map[k].done++;
      }
    });
    return map;
  }, [tasks]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => (t.tags ?? []).forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const dayTasks = useMemo(() => {
    let list = tasks.filter(t => !t.parent_id && taskCoversDay(t.scheduled_date, t.end_date, selected));

    // Apply filters
    if (filters.priorities.length) list = list.filter(t => filters.priorities.includes(t.priority));
    if (filters.tags.length) list = list.filter(t => (t.tags ?? []).some(tag => filters.tags.includes(tag)));
    if (!filters.showCompleted) list = list.filter(t => !t.completed);

    // Sort
    const sorters: Record<typeof filters.sort, (a: Task, b: Task) => number> = {
      manual:       (a, b) => a.position - b.position,
      priority:     (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      time:         (a, b) => (a.start_time ?? 'z').localeCompare(b.start_time ?? 'z'),
      created_desc: (a, b) => b.created_at.localeCompare(a.created_at),
      created_asc:  (a, b) => a.created_at.localeCompare(b.created_at),
      alpha:        (a, b) => a.title.localeCompare(b.title),
    };
    list = [...list].sort(sorters[filters.sort]);

    if (filters.pinnedFirst) {
      list = [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    }
    return list;
  }, [tasks, selected, filters]);

  const stats = useMemo(() => {
    const total = dayTasks.length;
    const done = dayTasks.filter(t => t.completed).length;
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [dayTasks]);

  const subtasksOf = (id: string) => tasks.filter(t => t.parent_id === id);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }, []);
  const name = (user?.user_metadata?.display_name as string) || (user?.email?.split('@')[0]) || 'there';

  const handleSwipeComplete = (t: Task) => {
    toggle.mutate(t);
    toast.success(t.completed ? 'Marked incomplete' : 'Marked complete');
  };
  const handleSwipeDelete = (t: Task) => {
    remove.mutate(t.id);
    toast.success('Task deleted');
  };

  return (
    <div className="px-4 pt-3 space-y-4">
      <header className="px-1 animate-fade-up flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{greeting},</p>
          <h1 className="text-2xl font-display leading-tight truncate">{name}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/search"
            aria-label="Search tasks"
            className="h-10 w-10 rounded-full glass btn-bordered inline-flex items-center justify-center pressable focus-ring"
          >
            <Search className="w-4 h-4" />
          </Link>
          {stats.total > 0 && (
            <div className="glass glow-border rounded-2xl px-3 py-2 flex items-center gap-2">
              {stats.pct === 100 ? (
                <Flame className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <div className="text-[11px] leading-tight">
                <div className="font-semibold">{stats.done}/{stats.total}</div>
                <div className="text-muted-foreground">{stats.pct}% done</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <WeekStrip
        selected={selected}
        onSelect={setSelected}
        onWeekShift={(d) => { const ns = addDays(weekStart, d); setWeekStart(ns); setSelected(ns); }}
        weekStart={weekStart}
        countByDate={countByDate}
      />

      <section>
        <div className="flex items-center justify-between px-1 mb-2 gap-2">
          <h2 className="text-[15px] font-semibold truncate">
            {isToday(selected) ? 'Today' : isSameDay(selected, addDays(new Date(), 1)) ? 'Tomorrow' : format(selected, 'EEEE, MMM d')}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground hidden xs:inline">
              {dayTasks.filter(t => t.pinned).length > 0 && (
                <span className="inline-flex items-center gap-1 mr-2"><Pin className="w-2.5 h-2.5" /> {dayTasks.filter(t => t.pinned).length}</span>
              )}
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            <TaskFilters value={filters} onChange={setFilters} availableTags={availableTags} />
          </div>
        </div>

        {dayTasks.length === 0 ? (
          <div className="glass glow-border rounded-2xl px-4 py-5 flex items-center justify-between gap-3 animate-scale-in">
            <div className="min-w-0">
              <p className="font-medium text-sm">Nothing planned yet</p>
              <p className="text-[12px] text-muted-foreground">Tap to add your first task.</p>
            </div>
            <Button onClick={() => setCreating(true)} size="sm" className="rounded-xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 pressable h-8 shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map(t => (
              <SwipeableTask
                key={t.id}
                onComplete={() => handleSwipeComplete(t)}
                onDelete={() => handleSwipeDelete(t)}
              >
                <TaskCard task={t} subtasks={subtasksOf(t.id)} onToggle={toggle.mutate} onClick={setEditing} />
              </SwipeableTask>
            ))}
            <p className="text-center text-[10.5px] text-muted-foreground pt-1">
              Swipe right to complete · left to delete
            </p>
          </div>
        )}
      </section>

      <TaskEditor open={!!editing} onOpenChange={(o) => !o && setEditing(null)} task={editing} />
      <TaskEditor open={creating} onOpenChange={setCreating} initialDate={selected} />
    </div>
  );
}
