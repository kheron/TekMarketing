'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, RefreshCw, X, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface PendingItem {
  id: string
  platform: string
  format: string
  title: string | null
  body: string
  agentReasoning: string | null
  confidence: number | null
  createdAt: string
}

export function ApprovalsPanel() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null

  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/content/pending')
      if (res.ok) {
        const data = await res.json()
        const list = data.items || []
        setItems(list)
        if (!selectedId && list.length > 0) setSelectedId(list[0].id)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function approve(id: string) {
    setIsActing(true)
    try {
      const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error('Approve failed')
      toast.success('Content approved')
      await load()
    } catch {
      toast.error('Failed to approve')
    } finally {
      setIsActing(false)
    }
  }

  async function reject(id: string) {
    setIsActing(true)
    try {
      const res = await fetch(`/api/content/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback || 'Rejected by reviewer' }),
      })
      if (!res.ok) throw new Error('Reject failed')
      toast.success('Content rejected')
      setFeedback('')
      await load()
    } catch {
      toast.error('Failed to reject')
    } finally {
      setIsActing(false)
    }
  }

  async function regenerate(id: string) {
    if (!feedback.trim()) {
      toast.error('Add feedback to guide regeneration')
      return
    }
    setIsActing(true)
    try {
      const res = await fetch(`/api/content/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      if (!res.ok) throw new Error('Regenerate failed')
      toast.success('Content regenerated — review the updated draft')
      setFeedback('')
      await load()
    } catch {
      toast.error('Failed to regenerate')
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) {
    return <div className="card p-12 text-center text-[#71717a]">Loading approvals...</div>
  }

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-lg font-medium mb-2">No pending approvals</div>
        <p className="text-sm text-[#71717a]">
          Run a planning cycle from the dashboard to generate content proposals.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-[#71717a]">
            {items.length} pending
          </span>
          <button onClick={load} className="btn btn-ghost h-8 px-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={`w-full text-left card p-4 transition-colors ${
              selected?.id === item.id ? 'border-blue-500/50 bg-[#111113]' : 'hover:border-[#3f3f46]'
            }`}
          >
            <div className="flex gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272a]">{item.platform}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272a]">{item.format}</span>
            </div>
            <div className="text-sm font-medium line-clamp-2">
              {item.title || item.body.slice(0, 80)}
            </div>
            <div className="text-[10px] text-[#52525b] mt-1">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="card p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">
              PENDING APPROVAL
            </span>
            {selected.confidence != null && (
              <span className="text-[10px] text-[#71717a]">
                Confidence: {Math.round(selected.confidence * 100)}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#71717a] mb-3">Draft content</h3>
              {selected.title && (
                <div className="font-semibold text-lg mb-3">{selected.title}</div>
              )}
              <pre className="whitespace-pre-wrap text-sm text-[#e4e4e7] leading-relaxed font-sans">
                {selected.body}
              </pre>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#71717a] mb-3">Agent reasoning</h3>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-[#a1a1aa] leading-relaxed">
                {selected.agentReasoning || 'No reasoning provided.'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-2">
              Feedback (for reject or regenerate)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Make the hook stronger, shorten for LinkedIn, add a clearer CTA..."
              className="input w-full min-h-[80px] resize-y"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-[#27272a]">
            <button
              onClick={() => approve(selected.id)}
              disabled={isActing}
              className="btn btn-primary h-10"
            >
              {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => regenerate(selected.id)}
              disabled={isActing}
              className="btn btn-secondary h-10"
            >
              <MessageSquare className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={() => reject(selected.id)}
              disabled={isActing}
              className="btn btn-ghost h-10 text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
