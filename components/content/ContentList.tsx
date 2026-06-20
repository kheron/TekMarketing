'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface ContentItemRow {
  id: string
  platform: string
  format: string
  title: string | null
  body: string
  status: string
  agentReasoning: string | null
  confidence: number | null
  createdAt: string
}

interface ContentListProps {
  title: string
  description: string
  formats: string[]
  emptyTitle: string
  emptyDescription: string
  reviewHref?: string
}

const statusColors: Record<string, string> = {
  PENDING_APPROVAL: 'text-amber-400 bg-amber-500/10',
  APPROVED: 'text-emerald-400 bg-emerald-500/10',
  PUBLISHED: 'text-blue-400 bg-blue-500/10',
  DRAFT: 'text-[#a1a1aa] bg-[#27272a]',
  REJECTED: 'text-red-400 bg-red-500/10',
}

export function ContentList({
  title,
  description,
  formats,
  emptyTitle,
  emptyDescription,
  reviewHref = '/content-studio/approvals',
}: ContentListProps) {
  const [items, setItems] = useState<ContentItemRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      formats.forEach((f) => params.append('format', f))
      const res = await fetch(`/api/content?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [formats.join(',')])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-[#71717a] mt-0.5">{description}</p>
        </div>
        <button onClick={load} className="btn btn-ghost h-9 px-3 text-xs border border-[#27272a]">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-[#71717a]">Loading content...</div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-lg font-medium mb-2">{emptyTitle}</div>
          <p className="text-sm text-[#71717a] max-w-md mx-auto">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const statusClass = statusColors[item.status] || statusColors.DRAFT
            return (
              <div key={item.id} className="card p-5 hover:border-[#3f3f46] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#27272a] text-[10px] font-medium">
                        {item.platform}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#27272a] text-[10px] font-medium">
                        {item.format.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusClass}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#52525b]">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {item.title && (
                      <div className="font-medium text-[15px] mb-1">{item.title}</div>
                    )}

                    <div className="text-sm text-[#a1a1aa] line-clamp-3 whitespace-pre-wrap">
                      {item.body}
                    </div>

                    {item.agentReasoning && (
                      <div className="text-xs text-[#71717a] mt-2 line-clamp-2">
                        <span className="text-[#a1a1aa] font-medium">Agent: </span>
                        {item.agentReasoning}
                      </div>
                    )}
                  </div>

                  {item.status === 'PENDING_APPROVAL' && (
                    <Link href={reviewHref} className="btn btn-secondary h-8 px-3 text-xs shrink-0">
                      <ExternalLink className="w-3 h-3" />
                      Review
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
