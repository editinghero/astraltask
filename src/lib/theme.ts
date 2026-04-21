export type Theme =
  | 'peach-light'
  | 'claude-light'
  | 'claude-dark'
  | 'true-dark'
  | 'warm-dark'
  | 'catppuccin-mocha';

export const THEMES: { id: Theme; label: string; swatch: string; mode: 'light' | 'dark'; hint: string }[] = [
  { id: 'peach-light',  label: 'Peach',  mode: 'light', hint: 'Soft & warm',
    swatch: 'linear-gradient(135deg,#fff1e3,#ffd9c2,#f4b8a3)' },
  { id: 'claude-light', label: 'Paper',  mode: 'light', hint: 'Cream',
    swatch: 'linear-gradient(135deg,#f7f3ec,#ece4d3,#d9b88a)' },
  { id: 'claude-dark',  label: 'Slate',  mode: 'dark',  hint: 'Warm slate',
    swatch: 'linear-gradient(135deg,#26241f,#1d1b18,#3a342c)' },
  { id: 'true-dark',    label: 'Dark',   mode: 'dark',  hint: 'Near-black',
    swatch: 'linear-gradient(135deg,#0f0f0f,#1a1a1a,#2a2a2a)' },
  { id: 'warm-dark',    label: 'Cocoa',  mode: 'dark',  hint: 'Custom warm',
    swatch: 'linear-gradient(135deg,#221F1E,#342E28,#B1906C,#DDC6A5)' },
  { id: 'catppuccin-mocha', label: 'Mocha', mode: 'dark', hint: 'Catppuccin',
    swatch: 'linear-gradient(135deg,#1e1e2e,#bac2de,#cba6f7)' },
];

const KEY = 'astraltask-theme';

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEY, theme);
  const mode = THEMES.find(t => t.id === theme)?.mode ?? 'dark';
  document.documentElement.style.colorScheme = mode;
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getStoredTheme(): Theme {
  const t = localStorage.getItem(KEY) as Theme | null;
  if (t && THEMES.some(x => x.id === t)) return t;
  // migrate old lovable-dark → true-dark
  if (t === 'lovable-dark' as any) return 'true-dark';
  // Auto-pick by system preference: dark → cocoa, light → paper
  return systemPrefersDark() ? 'warm-dark' : 'claude-light';
}
