import type {
  AchievementsOverview,
  ApiResponse,
  Contest,
  CreateRevisionItemInput,
  NotificationsOverview,
  OpenSourceOverview,
  QuestsOverview,
  RevisionOverview,
  TaskHistoryOverview,
  DailyTasksOverview,
  PlatformStats,
  TaskMomentumSummary,
  TaskStatus,
  UserDto,
} from '@forge/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3101'

let cachedToken: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value

  const res = await fetch('/api/token')
  if (!res.ok) throw new Error('Not authenticated')
  const { token } = (await res.json()) as { token: string }
  // Token lives 15 min server-side; refresh after 12.
  cachedToken = { value: token, expiresAt: Date.now() + 12 * 60 * 1000 }
  return token
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })

  const body = (await res.json()) as ApiResponse<T>
  if (!body.success) {
    throw new ApiClientError(body.error.code, body.error.message)
  }
  return body.data
}

export interface CodingAccountDto {
  id: string
  platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB'
  handle: string
  verified: boolean
}

export const api = {
  me: () => request<UserDto>('/users/me'),
  updateProfile: (input: { displayName?: string; bio?: string; timezone?: string }) =>
    request('/users/me/profile', { method: 'PATCH', body: JSON.stringify(input) }),

  accounts: () => request<CodingAccountDto[]>('/platforms/accounts'),
  connectAccount: (platform: string, handle: string) =>
    request<CodingAccountDto>('/platforms/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, handle }),
    }),
  disconnectAccount: (platform: string) => request(`/platforms/${platform}`, { method: 'DELETE' }),
  platformStats: (platform: string) => request<PlatformStats>(`/platforms/${platform}/stats`),

  upcomingContests: () => request<Contest[]>('/contests/upcoming'),

  todayTasks: () => request<DailyTasksOverview>('/tasks/today'),
  taskSummary: () => request<TaskMomentumSummary>('/tasks/summary'),
  taskHistory: () => request<TaskHistoryOverview>('/tasks/history'),
  generateTodayTasks: () =>
    request<DailyTasksOverview>('/tasks/today/generate', { method: 'POST' }),
  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    request<DailyTasksOverview>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  achievements: () => request<AchievementsOverview>('/achievements'),

  quests: () => request<QuestsOverview>('/quests'),

  openSource: (language?: string) =>
    request<OpenSourceOverview>(`/open-source${language ? `?language=${encodeURIComponent(language)}` : ''}`),

  revision: () => request<RevisionOverview>('/revision'),
  createRevisionItem: (input: CreateRevisionItemInput) =>
    request<void>('/revision', { method: 'POST', body: JSON.stringify(input) }),
  reviewRevisionItem: (id: string) =>
    request<RevisionOverview>(`/revision/${id}/review`, { method: 'POST' }),

  notifications: () => request<NotificationsOverview>('/notifications'),
  markNotificationRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request<void>('/notifications/read-all', { method: 'POST' }),
}
