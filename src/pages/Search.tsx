import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, Task } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import TaskEditor from '@/components/TaskEditor';
import SwipeableTask from '@/components/SwipeableTask';
import { Search as SearchIcon, X, ArrowLeft, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Search() {
  const navigate = useNavigate();
  const { tasks, toggle, remove } = useTasks();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Task | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => (t.tags ?? []).forEach(x => set.add(x)));
    return Array.from(set).sort();
  }, [tasks]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !activeTag) return [];
    const base = tasks.filter(t => !t.parent_id);
    return base.filter(t => {
      const hitTag = activeTag ? (t.tags ?? []).includes(activeTag) : true;
      if (!hitTag) return false;
      if (!q) return true;
      const inTitle = t.title.toLowerCase().includes(q);
      const inNotes = (t.notes ?? '').toLowerCase().includes(q);
      const inTags = (t.tags ?? []).some(tag => tag.toLowerCase().includes(q));
      return inTitle || inNotes || inTags;
    });
  }, [tasks, query, activeTag]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    results.forEach(t => {
      (map[t.scheduled_date] ||= []).push(t);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [results]);

  const hasInput = query.trim().length > 0 || !!activeTag;

  return (
    <div className="px-4 pt-3 space-y-4">
      <header className="flex items-center gap-2 px-1 animate-fade-up">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="h-9 w-9 rounded-full glass btn-bordered inline-flex items-center justify-center pressable shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display leading-tight">Search</h1>
          <p className="text-[11px] text-muted-foreground">Find tasks by title, notes, or tag.</p>
        </div>
      </header>

      {/* Search input */}
      <div className="glass glow-border rounded-2xl px-3 h-12 flex items-center gap-2">
        <SearchIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all dates..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear"
            className="h-6 w-6 rounded-full hover:bg-muted/40 inline-flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="px-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Hash className="w-2.5 h-2.5" /> Filter by tag
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(t => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(active ? null : t)}
                  className={cn(
                    'text-[11px] font-medium px-2.5 py-1 rounded-full border pressable transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-foreground/15 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {!hasInput ? (
        <div className="glass glow-border rounded-2xl px-4 py-8 text-center">
          <SearchIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
          <p className="text-sm font-medium">Start typing to search</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Searches title, notes, and tags across every date.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass glow-border rounded-2xl px-4 py-6 text-center text-[13px] text-muted-foreground">
          No tasks match {query && <span className="font-medium text-foreground">"{query}"</span>}{activeTag && <> with tag <span className="font-medium text-foreground">#{activeTag}</span></>}.
        </div>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground px-1">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
          {grouped.map(([date, items]) => (
            <section key={date} className="space-y-2">
              <h2 className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                {format(parseISO(date), 'EEEE, MMM d, yyyy')}
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
          ))}
        </>
      )}

      <TaskEditor open={!!editing} onOpenChange={(o) => !o && setEditing(null)} task={editing} />
      <TaskEditor open={!!editingSubtask} onOpenChange={(o) => !o && setEditingSubtask(null)} task={editingSubtask} parentTask={editingSubtask?.parent_id ? tasks.find(t => t.id === editingSubtask.parent_id) : undefined} />
    </div>
  );
}
