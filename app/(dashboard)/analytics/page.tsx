'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Zap, BarChart3 } from 'lucide-react'

interface UsageData {
  totalCalls: number
  totalTokens: number
  estimatedCostUsd: number
  recentLogs: Array<{
    id: string
    model: string
    purpose: string
    totalTokens: number | null
    estimatedCostUsd: number | null
    createdAt: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUsage() {
      try {
        const res = await fetch('/api/usage')
        if (res.ok) {
          const usage = await res.json()
          setData(usage)
        }
      } catch (e) {
        console.error('Failed to load usage data')
      } finally {
        setIsLoading(false)
      }
    }
    loadUsage()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <Link href="/" className="flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Analytics &amp; Usage</h1>
        <p className="text-[#71717a]">Track agent activity and API consumption.</p>
      </div>

      {isLoading ? (
        <div className="text-[#71717a]">Loading usage data...</div>
      ) : !data ? (
        <div className="card p-8">Could not load usage data.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-sm text-[#a1a1aa]">Total API Calls</div>
              </div>
              <div className="text-4xl font-semibold tracking-tight">{data.totalCalls}</div>
              <div className="text-xs text-[#52525b] mt-1">xAI / Grok requests</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-sm text-[#a1a1aa]">Total Tokens Used</div>
              </div>
              <div className="text-4xl font-semibold tracking-tight">{(data.totalTokens || 0).toLocaleString()}</div>
              <div className="text-xs text-[#52525b] mt-1">Prompt + Completion tokens</div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-sm text-[#a1a1aa]">Estimated Spend</div>
              </div>
              <div className="text-4xl font-semibold tracking-tight">${(data.estimatedCostUsd || 0).toFixed(4)}</div>
              <div className="text-xs text-[#52525b] mt-1">Rough estimate based on current rates</div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Recent API Calls</h2>
              <Link href="/usage" className="text-sm text-[#3b82f6] hover:underline">View full log →</Link>
            </div>
            {data.recentLogs.length === 0 ? (
              <div className="text-[#71717a] py-8 text-center">No API usage recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#71717a] border-b border-[#27272a]">
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Purpose</th>
                      <th className="py-3 pr-4">Model</th>
                      <th className="py-3 pr-4 text-right">Tokens</th>
                      <th className="py-3 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {data.recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#111113]">
                        <td className="py-3 pr-4 text-[#a1a1aa] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 pr-4"><span className="px-2 py-0.5 rounded bg-[#27272a] text-xs">{log.purpose}</span></td>
                        <td className="py-3 pr-4 text-[#a1a1aa]">{log.model}</td>
                        <td className="py-3 pr-4 text-right font-mono text-[#a1a1aa]">{log.totalTokens?.toLocaleString() ?? '—'}</td>
                        <td className="py-3 text-right font-mono text-emerald-400">${log.estimatedCostUsd ? log.estimatedCostUsd.toFixed(5) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="mt-8 text-xs text-[#52525b]">Note: Cost estimates are approximate and based on current xAI pricing. Actual billing may differ.</div>
        </>
      )}
    </div>
  )
}
