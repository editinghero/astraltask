import { Task } from '@/hooks/useTasks';

const LOCAL_STORAGE_TASKS_KEY = 'astraltask_tasks';
const LOCAL_STORAGE_PROFILE_KEY = 'astraltask_profile';

// Artificial delay to mock async behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Profile {
  user_id: string;
  display_name?: string;
  theme?: string;
}

class LocalStorageApi {
  // Helpers
  private getStoredTasks(): Task[] {
    const data = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private setStoredTasks(tasks: Task[]) {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }

  private getStoredProfile(): Profile {
    const data = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    return data ? JSON.parse(data) : { user_id: 'local_user', display_name: 'Local User' };
  }

  private setStoredProfile(profile: Profile) {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  }

  // Tasks
  async getTasks() {
    await delay(150);
    const tasks = this.getStoredTasks();
    return { tasks };
  }

  async getTasksByRange(start: string, end: string) {
    await delay(150);
    const tasks = this.getStoredTasks();
    // Simplified filtering logic, similar to what the backend would do
    const filteredTasks = tasks.filter(t => {
      const taskDate = t.scheduled_date;
      return taskDate >= start && taskDate <= end;
    });
    return { tasks: filteredTasks };
  }

  async createTask(task: Partial<Task>) {
    await delay(200);
    const tasks = this.getStoredTasks();

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      user_id: 'local_user',
      created_at: Date.now(),
      updated_at: Date.now(),
      completed: false,
    };

    tasks.push(newTask);
    this.setStoredTasks(tasks);

    return { task: newTask };
  }

  async updateTask(id: string, updates: Partial<Task>) {
    await delay(200);
    const tasks = this.getStoredTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updated_at: Date.now(),
    };

    this.setStoredTasks(tasks);
    return { task: tasks[index] };
  }

  async deleteTask(id: string) {
    await delay(200);
    const tasks = this.getStoredTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    this.setStoredTasks(filteredTasks);
    return { success: true };
  }

  // Profile
  async getProfile() {
    await delay(100);
    return { profile: this.getStoredProfile() };
  }

  async updateProfile(updates: Partial<Profile>) {
    await delay(200);
    const profile = this.getStoredProfile();
    const updatedProfile = { ...profile, ...updates };
    this.setStoredProfile(updatedProfile);
    return { profile: updatedProfile };
  }

  async deleteAccount() {
    await delay(500);
    localStorage.removeItem(LOCAL_STORAGE_TASKS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    return { success: true };
  }
}

export const api = new LocalStorageApi();
