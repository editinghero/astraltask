import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { scheduleNotification, cancelNotification } from '@/lib/notifications';

export interface Task {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  notes: string | null;
  scheduled_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  completed: number | boolean;
  priority: 'low' | 'medium' | 'high';
  color: string | null;
  notify_at: number | string | null;
  notify_enabled: number | boolean;
  position: number;
  tags: string | string[];
  pinned: number | boolean;
  created_at: number | string;
  updated_at: number | string;
}

export type TaskInput = Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & {
  title: string;
  scheduled_date: string;
};

// Helper to normalize task from D1 (SQLite returns integers for booleans)
function normalizeTask(task: any): Task {
  return {
    ...task,
    completed: !!task.completed,
    notify_enabled: !!task.notify_enabled,
    pinned: !!task.pinned,
    tags: typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags,
    notify_at: task.notify_at ? (typeof task.notify_at === 'number' ? new Date(task.notify_at * 1000).toISOString() : task.notify_at) : null,
  };
}

export function useTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Task[]> => {
      const data = await api.getTasks();
      return (data.tasks || []).map(normalizeTask);
    },
  });

  // Schedule notifications when tasks change
  useEffect(() => {
    if (!query.data) return;
    query.data.forEach((t) => {
      if (t.notify_enabled && t.notify_at && !t.completed) {
        scheduleNotification(t.id, new Date(t.notify_at), t.title, t.notes ?? 'Reminder for your task');
      } else {
        cancelNotification(t.id);
      }
    });
  }, [query.data]);

  const create = useMutation({
    mutationFn: async (input: TaskInput) => {
      if (!user) throw new Error('Not authenticated');
      const data = await api.createTask(input);
      return normalizeTask(data.task);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const data = await api.updateTask(id, patch);
      return normalizeTask(data.task);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      cancelNotification(id);
      await api.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggle = useMutation({
    mutationFn: async (task: Task) => {
      await api.updateTask(task.id, { completed: !task.completed });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { ...query, tasks: query.data ?? [], create, update, remove, toggle };
}
