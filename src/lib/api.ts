const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export interface Task {
  id: string;
  subject_id: number;
  category: '复习' | '预习' | '作业';
  title: string;
  description: string;
  weekdays: number[] | null;
  is_default: boolean;
}

export interface CheckinLog {
  minutes: number;
  mood: number;
  status: string;
}

export interface RewardItem {
  id: number;
  name: string;
  star_cost: number;
  description: string;
}

export interface Redemption {
  id: number;
  reward_item_id: number;
  reward_name: string;
  star_cost: number;
  status: string;
  request_date: string;
  approved_date: string | null;
}

export interface Stats {
  total: number;
  streak: number;
  categories: Record<string, number>;
  subjects: Record<number, number>;
}

export interface PendingItem {
  checkins: Array<{
    id: number;
    task_id: string;
    title: string;
    subject_id: number;
    category: string;
    checkin_date: string;
    minutes: number;
    mood: number;
    status: string;
  }>;
  redemptions: Array<{
    id: number;
    reward_name: string;
    star_cost: number;
    status: string;
    request_date: string;
  }>;
}

export const api = {
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (task: Partial<Task>) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id: string, task: Partial<Task>) => request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  deleteTask: (id: string) => request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  getTodayCheckins: () => request<Record<string, CheckinLog>>('/checkin/today'),
  checkin: (taskId: string, minutes: number, mood: number) => request<{ success: boolean }>('/checkin', { method: 'POST', body: JSON.stringify({ task_id: taskId, minutes, mood }) }),
  undoCheckin: (taskId: string) => request<{ success: boolean }>(`/checkin/${taskId}`, { method: 'DELETE' }),
  getHistory: () => request<Record<string, number>>('/checkin/history'),
  getStats: () => request<Stats>('/stats'),

  getRewards: () => request<RewardItem[]>('/rewards'),
  redeem: (rewardItemId: number, starCost: number, name: string) => request<{ success: boolean }>('/redemptions', { method: 'POST', body: JSON.stringify({ reward_item_id: rewardItemId, star_cost: starCost, name }) }),
  getRedemptions: () => request<Redemption[]>('/redemptions'),

  getPending: () => request<PendingItem>('/parent/pending'),
  approveCheckin: (id: number) => request<{ success: boolean }>(`/parent/checkin/${id}/approve`, { method: 'POST' }),
  rejectCheckin: (id: number) => request<{ success: boolean }>(`/parent/checkin/${id}/reject`, { method: 'POST' }),
  approveRedemption: (id: number) => request<{ success: boolean }>(`/parent/redemption/${id}/approve`, { method: 'POST' }),
  rejectRedemption: (id: number) => request<{ success: boolean }>(`/parent/redemption/${id}/reject`, { method: 'POST' }),

  getMessage: () => request<{ message: string }>('/parent/message'),
  saveMessage: (message: string) => request<{ success: boolean }>('/parent/message', { method: 'POST', body: JSON.stringify({ message }) }),
};
