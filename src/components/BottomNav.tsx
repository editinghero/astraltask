import { NavLink } from 'react-router-dom';
import { Calendar, Home, Plus, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { onAddTask: () => void; }

type NavItem = { to: string | null; icon: typeof Home; label: string; isAction?: boolean };
const items: NavItem[] = [
  { to: '/', icon: Home, label: 'Today' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: null, icon: Plus, label: 'Add', isAction: true },
  { to: '/upcoming', icon: Sparkles, label: 'Upcoming' },
  { to: '/profile', icon: User, label: 'You' },
];

export default function BottomNav({ onAddTask }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-xl mx-auto px-4 pb-3 safe-bottom pointer-events-auto">
        <div className="glass-strong glow-border nav-bottom-bar rounded-[1.75rem] px-2 py-2 flex items-center justify-around">
          {items.map((item, i) => {
            const Icon = item.icon;
            if (item.isAction) {
              return (
                <button
                  key={i}
                  onClick={onAddTask}
                  aria-label="Add task"
                  className="-mt-5 w-12 h-12 rounded-2xl btn-bordered bg-primary text-primary-foreground flex items-center justify-center pressable hover:bg-primary/90 focus-ring"
                >
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </button>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === '/'}
                className={({ isActive }) => cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl pressable',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 1.9} />
                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
