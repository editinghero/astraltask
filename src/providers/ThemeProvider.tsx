import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { applyTheme, getStoredTheme, Theme } from '@/lib/theme';

interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void; }
const Ctx = createContext<ThemeCtx | null>(null);

// Theme colors for PWA meta tag
const THEME_COLORS: Record<Theme, string> = {
  'peach-light': '#fff1e3',
  'claude-light': '#f7f3ec',
  'claude-dark': '#26241f',
  'true-dark': '#0f0f0f',
  'warm-dark': '#221F1E',
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('warm-dark');
  
  useEffect(() => {
    const t = getStoredTheme();
    setThemeState(t);
    applyTheme(t);
  }, []);
  
  // Update PWA theme-color meta tag when theme changes
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', THEME_COLORS[theme] || '#221F1E');
    }
  }, [theme]);
  
  const setTheme = (t: Theme) => { setThemeState(t); applyTheme(t); };
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme must be inside ThemeProvider');
  return c;
};
