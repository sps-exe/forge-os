'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiClientError } from './client'

export const queryKeys = {
  me: ['me'] as const,
  accounts: ['accounts'] as const,
  stats: (platform: string) => ['stats', platform] as const,
  contests: ['contests'] as const,
  todayTasks: ['tasks', 'today'] as const,
  taskSummary: ['tasks', 'summary'] as const,
  taskHistory: ['tasks', 'history'] as const,
  achievements: ['achievements'] as const,
  quests: ['quests'] as const,
  openSource: (language?: string) => ['open-source', language] as const,
  revision: ['revision'] as const,
  notifications: ['notifications'] as const,
}

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: api.me })
}

export function useAccounts() {
  return useQuery({ queryKey: queryKeys.accounts, queryFn: api.accounts })
}

export function usePlatformStats(platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB', enabled = true) {
  return useQuery({
    queryKey: queryKeys.stats(platform),
    queryFn: () => api.platformStats(platform),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't hammer the API when the account simply isn't connected.
      if (error instanceof ApiClientError && error.code === 'NOT_FOUND') return false
      return failureCount < 2
    },
  })
}

export function useUpcomingContests() {
  return useQuery({
    queryKey: queryKeys.contests,
    queryFn: api.upcomingContests,
    staleTime: 15 * 60 * 1000,
  })
}

export function useTodayTasks() {
  return useQuery({
    queryKey: queryKeys.todayTasks,
    queryFn: api.todayTasks,
    staleTime: 60 * 1000,
  })
}

export function useTaskSummary() {
  return useQuery({
    queryKey: queryKeys.taskSummary,
    queryFn: api.taskSummary,
    staleTime: 60 * 1000,
  })
}

export function useTaskHistory() {
  return useQuery({
    queryKey: queryKeys.taskHistory,
    queryFn: api.taskHistory,
    staleTime: 60 * 1000,
  })
}

export function useGenerateTodayTasks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.generateTodayTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks })
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary })
      queryClient.invalidateQueries({ queryKey: queryKeys.taskHistory })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string
      status: 'PENDING' | 'COMPLETED' | 'SKIPPED'
    }) => api.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTasks })
      queryClient.invalidateQueries({ queryKey: queryKeys.taskSummary })
      queryClient.invalidateQueries({ queryKey: queryKeys.taskHistory })
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements })
    },
  })
}

export function useAchievements() {
  return useQuery({
    queryKey: queryKeys.achievements,
    queryFn: api.achievements,
    staleTime: 60 * 1000,
  })
}

export function useQuests() {
  return useQuery({
    queryKey: queryKeys.quests,
    queryFn: api.quests,
    staleTime: 60 * 1000,
  })
}

export function useOpenSource(language?: string) {
  return useQuery({
    queryKey: queryKeys.openSource(language),
    queryFn: () => api.openSource(language),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRevision() {
  return useQuery({
    queryKey: queryKeys.revision,
    queryFn: api.revision,
    staleTime: 30 * 1000,
  })
}

export function useCreateRevisionItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof api.createRevisionItem>[0]) =>
      api.createRevisionItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.revision })
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useReviewRevisionItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.reviewRevisionItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.revision })
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
  })
}

export function useConnectAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ platform, handle }: { platform: string; handle: string }) =>
      api.connectAccount(platform, handle),
    onSuccess: (_data, { platform }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(platform) })
    },
  })
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (platform: string) => api.disconnectAccount(platform),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.notifications,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // poll every 60s for new notifications
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  })
}
