import { ReactNode, useRef, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const ACTION_THRESHOLD = 84;
const MAX_OFFSET = 140;

/** Touch + pointer swipe wrapper. Right = complete, left = delete. */
export default function SwipeableTask({ children, onComplete, onDelete, disabled }: Props) {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef<'h' | 'v' | null>(null);

  const reset = () => {
    setOffset(0);
    startX.current = null;
    startY.current = null;
    locked.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null || startY.current === null) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (locked.current === null) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) locked.current = 'h';
      else if (Math.abs(dy) > 8) locked.current = 'v';
    }
    if (locked.current !== 'h') return;
    const clamped = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx));
    setOffset(clamped);
  };
  const onPointerUp = () => {
    if (locked.current === 'h') {
      if (offset >= ACTION_THRESHOLD && onComplete) onComplete();
      else if (offset <= -ACTION_THRESHOLD && onDelete) onDelete();
    }
    reset();
  };

  const showComplete = offset > 12;
  const showDelete = offset < -12;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        <div
          className={cn(
            'flex items-center gap-2 text-success transition-opacity',
            showComplete ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-success/15 border border-success/40 flex items-center justify-center">
            <Check className="w-4 h-4" strokeWidth={3} />
          </div>
          <span className="text-xs font-semibold">Complete</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 text-destructive transition-opacity',
            showDelete ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span className="text-xs font-semibold">Delete</span>
          <div className="w-9 h-9 rounded-full bg-destructive/15 border border-destructive/40 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={reset}
        style={{
          transform: `translateX(${offset}px)`,
          transition: offset === 0 ? 'transform 220ms cubic-bezier(.22,1,.36,1)' : 'none',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
}
