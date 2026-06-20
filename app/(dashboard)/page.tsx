'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Play,
  RefreshCw,
  Clock,
  Sparkles,
  FolderOpen,
  CheckCircle,
  Building2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface ActivityLogDetails {
  reasoning?: string
  trigger?: string
}

interface ActivityLogItem {
  id: string
  type: string
  summary: string
  timestamp: string
  details?: ActivityLogDetails | null
}

interface AgentRunSummary {
  id: string
  summary: string | null
  startedAt: string
  completedAt: string | null
  status: string
}

interface DashboardData {
  recentLogs: ActivityLogItem[]
  pendingCount: number
  latestRun: AgentRunSummary | null
  hasBrand: boolean
}

const quickLinks = [
  {
    href: '/content-studio/generate',
    label: 'Generate & Copy',
    description: 'Multi-platform content with one-click copy',
    icon: Sparkles,
  },
  {
    href: '/content-studio/packages',
    label: 'Saved Packages',
    description: 'Browse and reuse past generations',
    icon: FolderOpen,
  },
  {
    href: '/content-studio/approvals',
    label: 'Agent Approvals',
    description: 'Review proposals from planning cycles',
    icon: CheckCircle,
  },
]

export default function TekMarketingDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isRunningCycle, setIsRunningCycle] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/activity')
      if (res.ok) {
        const realData = await res.json()
        setData(realData)
        setLastUpdated(new Date())
      }
    } catch {
      // keep previous data on transient failures
    }
  }, [])

  async function runPlanningCycle() {
    setIsRunningCycle(true)
    try {
      const res = await fetch('/api/agent/run', { method: 'POST' })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || 'Failed to run cycle')

      toast.success('Planning cycle completed!', {
        description: `${result.proposalsCreated || 0} new proposals created.`,
        duration: 6000,
      })

      await loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error('Planning cycle failed', { description: message })
    } finally {
      setIsRunningCycle(false)
    }
  }

  useEffect(() => {
    loadData()

    const interval = setInterval(() => {
      if (!isRunningCycle) {
        loadData()
        setLastUpdated(new Date())
      }
    }, 25000)

    return () => clearInterval(interval)
  }, [isRunningCycle, loadData])

  if (!data) {
    return (
      <div className="dashboard-page max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 text-[#71717a]">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading agent dashboard...
        </div>
      </div>
    )
  }

  const lastRunTime = data.latestRun
    ? formatDistanceToNow(new Date(data.latestRun.startedAt), { addSuffix: true })
    : 'never'

  return (
    <div className="dashboard-page max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[2px] text-[#71717a] mb-1">Dashboard</div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-1px]">Marketing Command Center</h1>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="text-[#71717a] text-sm mt-1">
            Last active {lastRunTime} · Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => loadData()}
            className="btn btn-ghost h-10 px-4 text-xs border border-[#27272a] hover:border-[#3f3f46] flex-1 sm:flex-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={runPlanningCycle}
            disabled={isRunningCycle || !data.hasBrand}
            className="btn btn-primary h-10 px-6 flex items-center gap-2 text-sm font-medium disabled:opacity-70 flex-1 sm:flex-none justify-center"
          >
            {isRunningCycle ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Planning Cycle
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-[1.5px] text-[#71717a] mb-2">Pending Your Review</div>
          <div className="text-4xl font-semibold tracking-tight tabular-nums">{data.pendingCount}</div>
          <div className="text-xs text-[#52525b] mt-1">drafts waiting for approval</div>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase tracking-[1.5px] text-[#71717a] mb-2">Recent Agent Activity</div>
          <div className="text-4xl font-semibold tracking-tight tabular-nums">{data.recentLogs.length}</div>
          <div className="text-xs text-[#52525b] mt-1">logged decisions & generations</div>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase tracking-[1.5px] text-[#71717a] mb-2">Last Strategy Run</div>
          <div className="text-4xl font-semibold tracking-tight tabular-nums">{data.latestRun ? '1' : '—'}</div>
          <div className="text-xs text-[#52525b] mt-1">
            {data.latestRun ? lastRunTime : 'No runs recorded yet'}
          </div>
          {data.latestRun?.summary && (
            <div className="mt-2 text-[11px] text-[#a1a1aa] line-clamp-2">
              {data.latestRun.summary}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase tracking-[1.5px] text-[#71717a] mb-2">This Week Performance</div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-semibold tracking-tight tabular-nums">—</div>
            <div className="text-emerald-400 text-sm">+0%</div>
          </div>
          <div className="text-xs text-[#52525b] mt-1">Performance data unlocks after publishing</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="font-semibold text-xl tracking-tight">Agent Activity Feed</div>
              <div className="text-sm text-[#71717a]">Transparent record of every decision and output</div>
            </div>
            <Link href="/content-studio/activity" className="text-sm text-[#3b82f6] hover:underline">
              Full history →
            </Link>
          </div>

          <div className="card p-2">
            {data.recentLogs.length > 0 ? (
              <div className="divide-y divide-[#27272a]">
                {data.recentLogs.map((log) => (
                  <ActivityItem key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Clock className="w-8 h-8 mx-auto text-[#3f3f46] mb-4" />
                <div className="text-[#a1a1aa] font-medium">The agent hasn&apos;t run yet</div>
                <p className="text-sm text-[#52525b] max-w-xs mx-auto mt-2">
                  Set up a business profile, then run your first planning cycle to populate the feed.
                </p>
                {!data.hasBrand && (
                  <Link href="/businesses/new" className="btn btn-primary mt-4 inline-flex">
                    <Building2 className="w-4 h-4" />
                    Set Up Business
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="card p-6">
            <div className="font-medium text-sm tracking-tight mb-4">Quick Actions</div>
            <div className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#111113] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium group-hover:text-white transition-colors">
                        {link.label}
                      </div>
                      <div className="text-xs text-[#52525b] truncate">{link.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-sm tracking-tight">Needs Your Review</div>
              <Link href="/content-studio/approvals" className="text-xs text-[#3b82f6]">
                Open queue →
              </Link>
            </div>

            {data.pendingCount > 0 ? (
              <div className="text-sm">
                <span className="font-semibold text-[#f4f4f5]">{data.pendingCount}</span> pieces of
                content are ready for your approval.
              </div>
            ) : (
              <div className="text-sm text-[#52525b]">
                When the agent has new proposals, they will appear here with full reasoning.
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="text-sm font-medium tracking-tight mb-2">Scheduled Runs</div>
            <div className="text-[#a1a1aa] text-sm mb-3">
              Daily strategy loop at 07:00 UTC via Inngest (configure in production).
            </div>
            <button
              onClick={runPlanningCycle}
              disabled={isRunningCycle || !data.hasBrand}
              className="w-full btn btn-secondary h-10 text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Play className="w-4 h-4" />
              Trigger Manual Cycle
            </button>
          </div>
        </div>
      </div>

      {!data.hasBrand && (
        <div className="mt-8 p-4 sm:p-6 border border-[#27272a] rounded-3xl bg-[#111113] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-semibold">The agent has no brand context yet.</div>
            <div className="text-sm text-[#71717a]">Without it, every recommendation will be generic.</div>
          </div>
          <Link href="/businesses" className="btn btn-primary whitespace-nowrap w-full sm:w-auto justify-center">
            Set Up Business Profile →
          </Link>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ log }: { log: ActivityLogItem }) {
  const time = formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })

  const typeConfig: Record<string, { label: string; color: string }> = {
    AGENT_PLANNING_STARTED: { label: 'PLANNING', color: 'text-blue-400 bg-blue-500/10' },
    AGENT_PLANNING_COMPLETED: { label: 'PLANNING', color: 'text-blue-400 bg-blue-500/10' },
    CONTENT_GENERATED: { label: 'GENERATED', color: 'text-emerald-400 bg-emerald-500/10' },
    CONTENT_REGENERATED: { label: 'REGENERATED', color: 'text-amber-400 bg-amber-500/10' },
    BRAND_UPDATED: { label: 'SETTINGS', color: 'text-violet-400 bg-violet-500/10' },
  }

  const config = typeConfig[log.type] || { label: log.type, color: 'text-[#a1a1aa] bg-[#27272a]' }

  return (
    <div className="px-4 sm:px-5 py-4 hover:bg-[#111113] transition-colors group flex flex-col sm:flex-row gap-2 sm:gap-4">
      <div className="text-xs text-[#52525b] sm:w-[78px] shrink-0 pt-0.5 tabular-nums">{time}</div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-[10px] font-medium px-2 py-px rounded ${config.color}`}>
            {config.label}
          </span>
          <span className="text-sm text-[#f4f4f5] group-hover:text-white transition-colors">
            {log.summary}
          </span>
        </div>

        {log.details && (
          <div className="text-xs text-[#71717a] pl-1 line-clamp-2">
            {log.details.reasoning || log.details.trigger || 'Details available in full log'}
          </div>
        )}
      </div>
    </div>
  )
}
