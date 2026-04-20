import { useEffect, useState } from 'react';
import { Task, TaskInput, useTasks } from '@/hooks/useTasks';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as Cal } from '@/components/ui/calendar';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Trash2, Plus, Bell, Clock, Sparkles, ChevronRight, CalendarRange, Pin, Tag, X, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { dateKey } from '@/lib/date';
import { requestPermission, getPermission } from '@/lib/notifications';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialDate?: Date;
  task?: Task | null;
  parentTask?: Task | null;
}

const PRIORITIES = [
  { id: 'low',    label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high',   label: 'High' },
] as const;

export default function TaskEditor({ open, onOpenChange, initialDate, task, parentTask }: Props) {
  const { tasks, create, update, remove } = useTasks();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRange, setIsRange] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyAt, setNotifyAt] = useState('');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newSub, setNewSub] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes ?? '');
      setDate(parseISO(task.scheduled_date));
      const ed = task.end_date ? parseISO(task.end_date) : null;
      setEndDate(ed);
      setIsRange(!!ed && ed.getTime() !== parseISO(task.scheduled_date).getTime());
      setStartTime(task.start_time?.slice(0,5) ?? '');
      setEndTime(task.end_time?.slice(0,5) ?? '');
      setPriority(task.priority);
      setNotifyEnabled(task.notify_enabled);
      setNotifyAt(task.notify_at ? format(new Date(task.notify_at), "yyyy-MM-dd'T'HH:mm") : '');
      setPinned(task.pinned ?? false);
      setTags(task.tags ?? []);
    } else {
      setTitle(''); setNotes('');
      setDate(initialDate ?? new Date());
      setEndDate(null); setIsRange(false);
      setStartTime(''); setEndTime('');
      setPriority('medium');
      setNotifyEnabled(false); setNotifyAt('');
      setPinned(false); setTags([]);
    }
    setTagInput(''); setNewSub('');
  }, [task, open, initialDate]);

  const subtasks = task ? tasks.filter(t => t.parent_id === task.id) : [];
  const rangeDays = isRange && endDate ? Math.max(1, differenceInCalendarDays(endDate, date) + 1) : 1;

  const addTag = () => {
    const v = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!v || tags.includes(v) || tags.length >= 5) { setTagInput(''); return; }
    setTags([...tags, v]);
    setTagInput('');
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (isRange && endDate && endDate < date) { toast.error('End date must be after start date'); return; }
    if (notifyEnabled && getPermission() !== 'granted') {
      const p = await requestPermission();
      if (p !== 'granted') {
        toast.warning('Notifications blocked', { description: 'Enable in browser settings.' });
      }
    }
    const payload: TaskInput = {
      title: title.trim(),
      notes: notes.trim() || null as any,
      scheduled_date: dateKey(date),
      end_date: isRange && endDate ? dateKey(endDate) : null as any,
      start_time: startTime || null as any,
      end_time: endTime || null as any,
      priority,
      notify_enabled: notifyEnabled,
      notify_at: notifyEnabled && notifyAt ? new Date(notifyAt).toISOString() : null as any,
      parent_id: parentTask?.id ?? task?.parent_id ?? null as any,
      pinned,
      tags,
    };
    try {
      if (task) {
        await update.mutateAsync({ id: task.id, ...payload } as any);
        toast.success('Task updated');
      } else {
        await create.mutateAsync(payload);
        toast.success('Task added');
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    await remove.mutateAsync(task.id);
    toast.success('Task deleted');
    onOpenChange(false);
  };

  const duplicate = async () => {
    if (!task) return;
    await create.mutateAsync({
      title: `${task.title} (copy)`,
      notes: task.notes,
      scheduled_date: task.scheduled_date,
      end_date: task.end_date,
      start_time: task.start_time,
      end_time: task.end_time,
      priority: task.priority,
      tags: task.tags,
      pinned: false,
    } as any);
    toast.success('Duplicated');
    onOpenChange(false);
  };

  const addSub = async () => {
    if (!task || !newSub.trim()) return;
    await create.mutateAsync({
      title: newSub.trim(),
      scheduled_date: task.scheduled_date,
      parent_id: task.id,
      priority: 'medium',
    });
    setNewSub('');
  };

  const postpone = async (days: number) => {
    if (!task) return;
    const newStart = new Date(date); newStart.setDate(newStart.getDate() + days);
    const newEnd = endDate ? new Date(endDate.getTime()) : null;
    if (newEnd) newEnd.setDate(newEnd.getDate() + days);
    setDate(newStart);
    if (newEnd) setEndDate(newEnd);
    await update.mutateAsync({
      id: task.id,
      scheduled_date: dateKey(newStart),
      end_date: newEnd ? dateKey(newEnd) : null,
    } as any);
    toast.success(`Postponed by ${days}d`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="glass-strong border-0 rounded-t-[2rem] max-h-[92vh] overflow-y-auto p-0">
        <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30 mt-3 mb-1" />
        <SheetHeader className="px-6 pt-3 pb-2">
          <SheetTitle className="text-2xl font-display gradient-text flex items-center justify-between">
            <span>{task ? 'Edit task' : parentTask ? 'New subtask' : 'New task'}</span>
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              aria-label={pinned ? 'Unpin' : 'Pin'}
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center pressable transition-colors',
                pinned
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'glass btn-bordered text-muted-foreground'
              )}
            >
              <Pin className={cn('w-4 h-4', pinned && 'fill-background')} />
            </button>
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-8 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Read chapter 3, prep slides…"
              className="glass btn-bordered h-12 rounded-2xl text-base"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add details, links, references…"
              className="glass btn-bordered rounded-2xl min-h-[88px] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Tags <span className="text-[11px] text-muted-foreground font-normal">({tags.length}/5)</span></Label>
            <div className="glass btn-bordered rounded-2xl p-2 flex flex-wrap gap-1.5 items-center min-h-[3rem]">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border border-foreground/15 bg-foreground/[0.05]">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  onBlur={addTag}
                  placeholder={tags.length === 0 ? 'study, work, urgent…' : '+ add'}
                  className="bg-transparent flex-1 min-w-[100px] text-sm focus:outline-none placeholder:text-muted-foreground"
                />
              )}
            </div>
          </div>

          {/* Date + range toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> When</Label>
              <button
                type="button"
                onClick={() => {
                  const next = !isRange;
                  setIsRange(next);
                  if (next && !endDate) {
                    const e = new Date(date); e.setDate(e.getDate() + 1);
                    setEndDate(e);
                  }
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full pressable transition-all border',
                  isRange
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-foreground/15'
                )}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                {isRange ? 'Range' : 'Single day'}
              </button>
            </div>

            <div className={cn('grid gap-2', isRange ? 'grid-cols-2' : 'grid-cols-1')}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="glass btn-bordered h-12 rounded-2xl w-full justify-start font-normal">
                    <CalendarIcon className="w-4 h-4 mr-2 opacity-70" />
                    <span className="text-xs text-muted-foreground mr-1.5">{isRange ? 'From' : 'On'}</span>
                    {format(date, 'MMM d')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-strong border-0 rounded-3xl" align="start">
                  <Cal mode="single" selected={date} onSelect={d => {
                    if (!d) return;
                    setDate(d);
                    if (isRange && endDate && endDate < d) setEndDate(d);
                  }} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>

              {isRange && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="glass btn-bordered h-12 rounded-2xl w-full justify-start font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2 opacity-70" />
                      <span className="text-xs text-muted-foreground mr-1.5">To</span>
                      {endDate ? format(endDate, 'MMM d') : '—'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-strong border-0 rounded-3xl" align="start">
                    <Cal mode="single" selected={endDate ?? undefined} onSelect={d => d && setEndDate(d)}
                         disabled={{ before: date }} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {isRange && (
              <p className="text-xs text-muted-foreground px-1">Spans {rangeDays} day{rangeDays === 1 ? '' : 's'} — appears on every day in this range.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex gap-1.5 p-1 rounded-2xl glass btn-bordered h-12 items-center">
              {PRIORITIES.map(p => (
                <button key={p.id} type="button" onClick={() => setPriority(p.id)}
                  className={cn('flex-1 text-xs font-semibold py-2 rounded-xl pressable transition-all border',
                    priority === p.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'text-muted-foreground border-transparent')}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time range (optional)</Label>
              {(startTime || endTime) && (
                <button onClick={() => { setStartTime(''); setEndTime(''); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="glass btn-bordered h-12 rounded-2xl" />
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="glass btn-bordered h-12 rounded-2xl" />
            </div>
          </div>

          <div className="glass btn-bordered rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 cursor-pointer"><Bell className="w-4 h-4" /> Notification reminder</Label>
              <Switch checked={notifyEnabled} onCheckedChange={setNotifyEnabled} />
            </div>
            {notifyEnabled && (
              <Input type="datetime-local" value={notifyAt} onChange={e => setNotifyAt(e.target.value)}
                className="glass btn-bordered h-11 rounded-xl" />
            )}
          </div>

          {task && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => postpone(1)} className="glass btn-bordered rounded-2xl pressable">+1d</Button>
              <Button variant="outline" onClick={() => postpone(7)} className="glass btn-bordered rounded-2xl pressable">+1w</Button>
              <Button variant="outline" onClick={duplicate} className="glass btn-bordered rounded-2xl pressable">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
          )}

          {task && !parentTask && !task.parent_id && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Subtasks</Label>
              <div className="space-y-1.5">
                {subtasks.map(s => (
                  <div key={s.id} className="glass btn-bordered rounded-2xl px-3 py-2.5 flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', s.completed ? 'bg-success' : 'bg-muted-foreground/40')} />
                    <span className={cn('flex-1 text-sm', s.completed && 'line-through opacity-60')}>{s.title}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSub())}
                  placeholder="Add subtask…" className="glass btn-bordered h-11 rounded-2xl" />
                <Button onClick={addSub} size="icon" className="h-11 w-11 rounded-2xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 pressable shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {task && (
              <Button variant="outline" onClick={handleDelete} aria-label="Delete task" className="glass btn-bordered rounded-2xl text-destructive pressable h-12 w-12 p-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={handleSave} className="flex-1 h-12 rounded-2xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 font-semibold pressable">
              {task ? 'Save changes' : 'Create task'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
