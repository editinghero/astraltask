// Browser notification helpers with service worker support
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

// Store scheduled notifications in localStorage for persistence
function saveScheduledNotifications() {
  const scheduled: Record<string, { when: string; title: string; body: string }> = {};
  timers.forEach((_, id) => {
    const stored = localStorage.getItem(`notif_${id}`);
    if (stored) {
      scheduled[id] = JSON.parse(stored);
    }
  });
  localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));
}

function loadScheduledNotifications() {
  try {
    const stored = localStorage.getItem('scheduled_notifications');
    if (!stored) return;
    
    const scheduled = JSON.parse(stored);
    Object.entries(scheduled).forEach(([id, data]: [string, any]) => {
      const when = new Date(data.when);
      if (when.getTime() > Date.now()) {
        scheduleNotification(id, when, data.title, data.body);
      }
    });
  } catch (e) {
    console.error('Failed to load scheduled notifications:', e);
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  loadScheduledNotifications();
}

export function scheduleNotification(id: string, when: Date, title: string, body: string) {
  cancelNotification(id);
  if (!notifSupported() || Notification.permission !== 'granted') return;
  
  const ms = when.getTime() - Date.now();
  if (ms <= 0) {
    // Show immediately if time has passed
    showNotification(title, body, id);
    return;
  }
  
  if (ms > 24 * 60 * 60 * 1000 * 30) return; // skip if > 30 days
  
  // Store notification data
  localStorage.setItem(`notif_${id}`, JSON.stringify({ when: when.toISOString(), title, body }));
  
  const t = window.setTimeout(() => {
    showNotification(title, body, id);
    localStorage.removeItem(`notif_${id}`);
    timers.delete(id);
    saveScheduledNotifications();
  }, ms);
  
  timers.set(id, t);
  saveScheduledNotifications();
}

function showNotification(title: string, body: string, tag: string) {
  try {
    // Try to use service worker notification first (more reliable)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/android-192x192.png',
          badge: '/favicon-48x48.png',
          tag,
          vibrate: [200, 100, 200],
          requireInteraction: false,
        });
      }).catch(() => {
        // Fallback to regular notification
        new Notification(title, { body, icon: '/favicon.ico', tag });
      });
    } else {
      // Fallback to regular notification
      new Notification(title, { body, icon: '/favicon.ico', tag });
    }
  } catch (e) {
    console.error('Failed to show notification:', e);
  }
}

export function cancelNotification(id: string) {
  const t = timers.get(id);
  if (t) { 
    clearTimeout(t); 
    timers.delete(id); 
  }
  localStorage.removeItem(`notif_${id}`);
  saveScheduledNotifications();
}

export function clearAllNotifications() {
  timers.forEach((t, id) => {
    clearTimeout(t);
    localStorage.removeItem(`notif_${id}`);
  });
  timers.clear();
  localStorage.removeItem('scheduled_notifications');
}
