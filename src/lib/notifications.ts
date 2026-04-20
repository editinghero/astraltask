// Browser notification helpers. For real background push on Android/iOS,
// wrap with Capacitor + @capacitor/local-notifications. While the PWA is open,
// we schedule notifications via setTimeout.
export type NotifPermission = 'default' | 'granted' | 'denied';

export function notifSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPermission(): NotifPermission {
  if (!notifSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotifPermission> {
  if (!notifSupported()) return 'denied';
  const p = await Notification.requestPermission();
  return p;
}

const timers = new Map<string, number>();

export function scheduleNotification(id: string, when: Date, title: string, body: string) {
  cancelNotification(id);
  if (!notifSupported() || Notification.permission !== 'granted') return;
  const ms = when.getTime() - Date.now();
  if (ms <= 0 || ms > 24 * 60 * 60 * 1000 * 30) return; // skip if past or > 30 days
  const t = window.setTimeout(() => {
    try { new Notification(title, { body, icon: '/favicon.ico', tag: id }); } catch {}
  }, ms);
  timers.set(id, t);
}

export function cancelNotification(id: string) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
}

export function clearAllNotifications() {
  timers.forEach(t => clearTimeout(t));
  timers.clear();
}
