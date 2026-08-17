import { useTheme } from '@/providers/ThemeProvider';
import { THEMES } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Check, Pencil, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPermission, requestPermission } from '@/lib/notifications';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import ImportExport from '@/components/ImportExport';

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const [perm, setPerm] = useState(getPermission());
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => { setPerm(getPermission()); }, []);
  useEffect(() => {
    api.getProfile().then(({ profile }) => {
      setName(profile.display_name || 'Local User');
    });
  }, []);

  const enableNotifs = async () => {
    const p = await requestPermission();
    setPerm(p);
    if (p === 'granted') toast.success('Notifications enabled');
    else toast.warning('Permission not granted');
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error('Name cannot be empty'); return; }
    setSavingName(true);
    try {
      await api.updateProfile({ display_name: trimmed });
      toast.success('Name updated');
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="px-4 pt-3 space-y-4">
      <header className="px-1 animate-fade-up">
        <h1 className="text-2xl font-display">You</h1>
      </header>

      {/* Account card */}
      <div className="glass glow-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold border border-primary">
            {(name?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="glass btn-bordered h-9 rounded-xl text-sm"
                  autoFocus
                />
                <Button onClick={saveName} disabled={savingName} size="sm" className="rounded-xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <p className="font-semibold text-sm truncate">{name}</p>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit name"
              className="h-9 w-9 rounded-xl glass btn-bordered flex items-center justify-center pressable"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">Theme</h2>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map(t => {
            const selected = theme === t.id;
            return (
              <button key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn('glass rounded-2xl p-2.5 pressable text-left relative transition-all border',
                  selected
                    ? 'border-foreground/40 glow-border-strong'
                    : 'border-[hsl(var(--surface-border))] hover:border-foreground/20')}>
                <div className="h-10 rounded-xl mb-2 border border-[hsl(var(--surface-border))]" style={{ background: t.swatch }} />
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{t.hint}</p>
                  </div>
                  {selected && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0 ml-1">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3.5} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass glow-border rounded-2xl p-4 space-y-2.5">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Notifications</h2>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-sm">Browser reminders</p>
            <p className="text-[11px] text-muted-foreground">Status: {perm}</p>
          </div>
          {perm !== 'granted' && (
            <Button onClick={enableNotifs} size="sm" className="rounded-xl btn-bordered bg-primary text-primary-foreground hover:bg-primary/90 pressable h-8">
              <Bell className="w-3.5 h-3.5 mr-1" /> Enable
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Reminders fire while the app is open. Install as PWA for background notifications on Android.
        </p>
      </section>

      <ImportExport />

      <DeleteAccountDialog />

      <p className="text-center text-[11px] text-muted-foreground py-2">AstralTask · v1.0</p>
    </div>
  );
}
