const API_URL = import.meta.env.VITE_API_URL || 'https://astraltask-api.quasars.workers.dev';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !endpoint.startsWith('/auth')) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Check if offline
      if (!navigator.onLine || error.message === 'Failed to fetch') {
        throw new Error('You are offline. Please check your connection.');
      }
      throw error;
    }
  }

  // Auth
  async signup(email: string, password: string, name?: string) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword(token: string, password: string) {
    return this.request('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  logout() {
    this.clearToken();
  }

  // Tasks
  async getTasks() {
    return this.request('/api/tasks');
  }

  async getTasksByRange(start: string, end: string) {
    return this.request(`/api/tasks/range?start=${start}&end=${end}`);
  }

  async createTask(task: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Profile
  async getProfile() {
    return this.request('/api/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAccount() {
    return this.request('/api/profile/account', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
