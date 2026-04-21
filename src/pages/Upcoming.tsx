import { useMemo, useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import TaskEditor from '@/components/TaskEditor';
import SwipeableTask from '@/components/SwipeableTask';
import TaskFilters, { DEFAULT_FILTERS, FilterState } from '@/components/TaskFilters';
import { format, isAfter, startOfDay, isSameDay, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Pin } from 'lucide-react';

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function Upcoming() {
  const { tasks, toggle, remove } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => (t.tags ?? []).forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  // Apply filters across all upcoming tasks first, then group by date
  const filtered = useMemo(() => {
    let list = tasks.filter(t => !t.parent_id);
    if (filters.priorities.length) list = list.filter(t => filters.priorities.includes(t.priority));
    if (filters.tags.length) list = list.filter(t => (t.tags ?? []).some(tag => filters.tags.includes(tag)));
    if (!filters.showCompleted) list = list.filter(t => !t.completed);
    return list;
  }, [tasks, filters]);

  const grouped = useMemo(() => {
    const today = startOfDay(new Date());
    const map: Record<string, Task[]> = {};
    filtered.forEach(t => {
      const start = parseISO(t.scheduled_date);
      const end = t.end_date ? parseISO(t.end_date) : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isAfter(d, today) || isSameDay(d, today)) {
          const k = d.toISOString().slice(0, 10);
          (map[k] ||= []).push(t);
        }
      }
    });

    const sorters: Record<typeof filters.sort, (a: Task, b: Task) => number> = {
      manual:       (a, b) => a.position - b.position,
      priority:     (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      time:         (a, b) => (a.start_time ?? 'z').localeCompare(b.start_time ?? 'z'),
      created_desc: (a, b) => b.created_at.localeCompare(a.created_at),
      created_asc:  (a, b) => a.created_at.localeCompare(b.created_at),
      alpha:        (a, b) => a.title.localeCompare(b.title),
    };

    Object.keys(map).forEach(k => {
      let items = [...map[k]].sort(sorters[filters.sort]);
      if (filters.pinnedFirst) items = [...items].sort((a, b) => Number(b.pinned) - Number(a.pinned));
      map[k] = items;
    });

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, filters]);

  const total = useMemo(() => grouped.reduce((sum, [, items]) => sum + items.length, 0), [grouped]);

  return (
    <div className="px-4 pt-3 space-y-4">
      <header className="px-1 animate-fade-up flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-display leading-tight">Upcoming</h1>
          <p className="text-xs text-muted-foreground">Everything ahead, in one stream.</p>
        </div>
      </header>

      <div className="flex items-center justify-between px-1 gap-2">
        <span className="text-[11px] text-muted-foreground">
          {total} {total === 1 ? 'task' : 'tasks'} across {grouped.length} {grouped.length === 1 ? 'day' : 'days'}
        </span>
        <TaskFilters value={filters} onChange={setFilters} availableTags={availableTags} />
      </div>

      {grouped.length === 0 ? (
        <div className="glass glow-border rounded-2xl px-4 py-5 text-center text-[13px] text-muted-foreground">
          No upcoming tasks match your filters.
        </div>
      ) : grouped.map(([date, items]) => {
        const pinnedCount = items.filter(i => i.pinned).length;
        return (
          <section key={date} className="space-y-2">
            <h2 className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider flex items-center justify-between">
              <span>{format(parseISO(date), 'EEEE, MMM d')}</span>
              <span className="flex items-center gap-2 normal-case tracking-normal">
                {pinnedCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-foreground/70">
                    <Pin className="w-2.5 h-2.5" /> {pinnedCount}
                  </span>
                )}
                <span>{items.length}</span>
              </span>
            </h2>
            {items.map(t => (
              <SwipeableTask
                key={t.id}
                onComplete={() => { toggle.mutate(t); toast.success(t.completed ? 'Marked incomplete' : 'Completed'); }}
                onDelete={() => { remove.mutate(t.id); toast.success('Task deleted'); }}
              >
                <TaskCard 
                  task={t} 
                  subtasks={tasks.filter(s => s.parent_id === t.id)} 
                  onToggle={toggle.mutate} 
                  onClick={(task) => {
                    if (task.parent_id) {
                      setEditingSubtask(task);
                    } else {
                      setEditing(task);
                    }
                  }} 
                />
              </SwipeableTask>
            ))}
          </section>
        );
      })}

      <TaskEditor open={!!editing} onOpenChange={(o) => !o && setEditing(null)} task={editing} />
      <TaskEditor open={!!editingSubtask} onOpenChange={(o) => !o && setEditingSubtask(null)} task={editingSubtask} parentTask={editingSubtask?.parent_id ? tasks.find(t => t.id === editingSubtask.parent_id) : undefined} />
    </div>
  );
}
