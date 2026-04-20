import { useState } from 'react';
import { Filter, X, Check, ArrowDownUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type SortKey = 'manual' | 'priority' | 'created_desc' | 'created_asc' | 'time' | 'alpha';
export interface FilterState {
  priorities: ('low' | 'medium' | 'high')[];
  tags: string[];
  showCompleted: boolean;
  pinnedFirst: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  priorities: [],
  tags: [],
  showCompleted: true,
  pinnedFirst: true,
  sort: 'manual',
};

interface Props {
  value: FilterState;
  onChange: (v: FilterState) => void;
  availableTags: string[];
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'manual',       label: 'Default' },
  { id: 'priority',     label: 'Priority' },
  { id: 'time',         label: 'Time of day' },
  { id: 'created_desc', label: 'Newest first' },
  { id: 'created_asc',  label: 'Oldest first' },
  { id: 'alpha',        label: 'A → Z' },
];

const PRIORITIES: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

export default function TaskFilters({ value, onChange, availableTags }: Props) {
  const [open, setOpen] = useState(false);
  const activeCount =
    value.priorities.length +
    value.tags.length +
    (value.showCompleted ? 0 : 1) +
    (value.sort !== 'manual' ? 1 : 0);

  const togglePriority = (p: 'low' | 'medium' | 'high') => {
    onChange({
      ...value,
      priorities: value.priorities.includes(p)
        ? value.priorities.filter(x => x !== p)
        : [...value.priorities, p],
    });
  };
  const toggleTag = (t: string) => {
    onChange({
      ...value,
      tags: value.tags.includes(t) ? value.tags.filter(x => x !== t) : [...value.tags, t],
    });
  };
  const reset = () => onChange(DEFAULT_FILTERS);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Filter and sort"
          className={cn(
            'h-8 px-3 rounded-full glass btn-bordered text-[11px] font-medium inline-flex items-center gap-1.5 pressable',
            activeCount > 0 && 'bg-primary/10 border-primary/40 text-foreground'
          )}
        >
          <Filter className="w-3 h-3" />
          Filter
          {activeCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="glass-strong glow-border rounded-2xl p-3 w-72 space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Filters</p>
          {activeCount > 0 && (
            <button onClick={reset} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
            <ArrowDownUp className="w-2.5 h-2.5" /> SORT BY
          </p>
          <div className="grid grid-cols-2 gap-1">
            {SORTS.map(s => (
              <button
                key={s.id}
                onClick={() => onChange({ ...value, sort: s.id })}
                className={cn(
                  'text-[11px] font-medium px-2 py-1.5 rounded-lg border pressable transition-colors',
                  value.sort === s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-foreground/15 text-muted-foreground hover:bg-muted/40'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground">PRIORITY</p>
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button
                key={p}
                onClick={() => togglePriority(p)}
                className={cn(
                  'flex-1 text-[11px] font-semibold capitalize px-2 py-1.5 rounded-lg border pressable',
                  value.priorities.includes(p)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-foreground/15 text-muted-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground">TAGS</p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {availableTags.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={cn(
                    'text-[11px] font-medium px-2 py-1 rounded-md border pressable',
                    value.tags.includes(t)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-foreground/15 text-muted-foreground'
                  )}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-1 pt-1 border-t border-foreground/10">
          <button
            onClick={() => onChange({ ...value, showCompleted: !value.showCompleted })}
            className="w-full flex items-center justify-between py-1.5 px-1 text-[12px]"
          >
            <span>Show completed</span>
            <span className={cn(
              'w-4 h-4 rounded border flex items-center justify-center',
              value.showCompleted ? 'bg-primary border-primary' : 'border-foreground/30'
            )}>
              {value.showCompleted && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
            </span>
          </button>
          <button
            onClick={() => onChange({ ...value, pinnedFirst: !value.pinnedFirst })}
            className="w-full flex items-center justify-between py-1.5 px-1 text-[12px]"
          >
            <span>Pinned first</span>
            <span className={cn(
              'w-4 h-4 rounded border flex items-center justify-center',
              value.pinnedFirst ? 'bg-primary border-primary' : 'border-foreground/30'
            )}>
              {value.pinnedFirst && <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
