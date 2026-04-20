import { THEMES } from '@/lib/theme';
import { useTheme } from '@/providers/ThemeProvider';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  variant?: 'icon' | 'pill';
  className?: string;
}

/** Compact theme picker. Used in Auth + Profile. */
export default function ThemePicker({ variant = 'icon', className }: Props) {
  const { theme, setTheme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Change theme"
          className={cn(
            'glass btn-bordered rounded-full pressable focus-ring inline-flex items-center justify-center gap-2 shrink-0',
            variant === 'pill' ? 'h-10 px-3.5 text-xs font-medium' : 'h-10 w-10',
            className,
          )}
        >
          <Palette className="w-4 h-4" />
          {variant === 'pill' && <span>Theme</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="glass-strong border border-[hsl(var(--surface-border))] rounded-2xl p-2 w-64"
      >
        <div className="grid grid-cols-2 gap-1.5">
          {THEMES.map(t => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'rounded-xl p-2 pressable text-left border transition-colors',
                  selected
                    ? 'border-foreground/40 bg-muted/40'
                    : 'border-[hsl(var(--surface-border))] hover:bg-muted/30',
                )}
              >
                <div
                  className="h-8 rounded-lg mb-1.5 border border-[hsl(var(--surface-border))]"
                  style={{ background: t.swatch }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium truncate">{t.label}</span>
                  {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
