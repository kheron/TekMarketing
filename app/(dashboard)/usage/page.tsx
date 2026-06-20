'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then(res => res.json())
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="dashboard-page max-w-6xl mx-auto w-full">
      <Link href="/analytics" className="flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Analytics
      </Link>

      <h1 className="text-4xl font-semibold tracking-tight mb-2">API Usage</h1>
      <p className="text-[#71717a] mb-8">Detailed view of all xAI API consumption.</p>

      {isLoading ? (
        <div>Loading...</div>
      ) : !data ? (
        <div>Failed to load data.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-6">
              <div className="text-sm text-[#a1a1aa]">Total Calls</div>
              <div className="text-4xl font-semibold mt-2">{data.totalCalls}</div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-[#a1a1aa]">Total Tokens</div>
              <div className="text-4xl font-semibold mt-2">{data.totalTokens?.toLocaleString()}</div>
            </div>
            <div className="card p-6">
              <div className="text-sm text-[#a1a1aa]">Estimated Cost</div>
              <div className="text-4xl font-semibold mt-2 text-emerald-400">
                ${(data.estimatedCostUsd || 0).toFixed(4)}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Calls</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#71717a] border-b border-[#27272a]">
                    <th className="py-2 pr-4">Timestamp</th>
                    <th className="py-2 pr-4">Purpose</th>
                    <th className="py-2 pr-4">Model</th>
                    <th className="py-2 pr-4 text-right">Tokens</th>
                    <th className="py-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {data.recentLogs.map(log => (
                    <tr key={log.id}>
                      <td className="py-2 pr-4 text-[#a1a1aa]">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{log.purpose}</td>
                      <td className="py-2 pr-4">{log.model}</td>
                      <td className="py-2 pr-4 text-right font-mono">{log.totalTokens}</td>
                      <td className="py-2 text-right font-mono text-emerald-400">
                        ${log.estimatedCostUsd?.toFixed(5) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
