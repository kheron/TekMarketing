'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface ActivityLog {
  id: string
  type: string
  summary: string
  timestamp: string
  contentItem?: { platform: string; format: string; title: string | null } | null
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/activity?limit=50')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="dashboard-page max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Activity"
        description="Immutable audit trail of agent decisions, approvals, and content generation."
      />

      <div className="flex justify-end mb-4">
        <button onClick={load} className="btn btn-ghost h-9 px-3 text-xs border border-[#27272a]">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-[#71717a]">Loading activity...</div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-[#71717a]">No activity yet.</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="card p-4 flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{log.summary}</div>
                <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-[#52525b]">
                  <span className="px-2 py-0.5 rounded bg-[#27272a]">{log.type.replace(/_/g, ' ')}</span>
                  <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                  {log.contentItem && (
                    <span>
                      {log.contentItem.platform} · {log.contentItem.format}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}