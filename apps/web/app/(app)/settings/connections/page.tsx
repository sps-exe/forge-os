'use client'

import { useState } from 'react'
import { Check, Code2, GitBranch, Loader2, Swords, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@forge/ui'
import { useAccounts, useConnectAccount, useDisconnectAccount } from '@/lib/api/hooks'
import { ApiClientError } from '@/lib/api/client'

const PLATFORMS: {
  platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB'
  title: string
  icon: LucideIcon
  accentClass: string
  placeholder: string
  managed?: boolean
}[] = [
  {
    platform: 'LEETCODE',
    title: 'LeetCode',
    icon: Code2,
    accentClass: 'text-platform-leetcode',
    placeholder: 'your-leetcode-username',
  },
  {
    platform: 'CODEFORCES',
    title: 'Codeforces',
    icon: Swords,
    accentClass: 'text-platform-codeforces',
    placeholder: 'your-codeforces-handle',
  },
  {
    platform: 'GITHUB',
    title: 'GitHub',
    icon: GitBranch,
    accentClass: 'text-platform-github',
    placeholder: 'your-github-username',
  },
]

function ConnectionRow({ config }: { config: (typeof PLATFORMS)[number] }) {
  const { data: accounts } = useAccounts()
  const connect = useConnectAccount()
  const disconnect = useDisconnectAccount()
  const [handle, setHandle] = useState('')

  const account = accounts?.find((a) => a.platform === config.platform)
  const Icon = config.icon

  const handleConnect = async () => {
    if (!handle.trim()) return
    try {
      await connect.mutateAsync({ platform: config.platform, handle: handle.trim() })
      toast.success(`${config.title} connected`)
      setHandle('')
    } catch (error) {
      toast.error(
        error instanceof ApiClientError ? error.message : `Couldn't connect ${config.title}`,
      )
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync(config.platform)
      toast.success(`${config.title} disconnected`)
    } catch {
      toast.error(`Couldn't disconnect ${config.title}`)
    }
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`size-5 ${config.accentClass}`} />
        <div>
          <p className="font-medium">{config.title}</p>
          {account ? (
            <p className="text-muted-foreground text-xs">@{account.handle}</p>
          ) : (
            <p className="text-muted-foreground text-xs">Not connected</p>
          )}
        </div>
      </div>

      {account ? (
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <Check className="mr-1 size-3" /> Connected
          </Badge>
          {!config.managed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
              aria-label={`Disconnect ${config.title}`}
            >
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </div>
      ) : config.managed ? (
        <Badge variant="secondary">Sign in with GitHub to link</Badge>
      ) : (
        <div className="flex gap-2">
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={config.placeholder}
            className="sm:w-52"
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          />
          <Button onClick={handleConnect} disabled={connect.isPending || !handle.trim()}>
            {connect.isPending ? <Loader2 className="animate-spin" /> : 'Connect'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Link your coding accounts so Forge can track everything in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coding platforms</CardTitle>
          <CardDescription>
            We only read public profile data. GitHub connects automatically when you sign in with
            it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLATFORMS.map((config) => (
            <ConnectionRow key={config.platform} config={config} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
