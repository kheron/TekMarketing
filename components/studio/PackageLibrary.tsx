'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, RefreshCw } from 'lucide-react'
import type { SocialPlatform } from '@/lib/agent/types'
import { getPlatformLabel } from '@/lib/constants/platforms'

interface PackageRow {
  id: string
  businessName: string
  topic: string
  platforms: SocialPlatform[]
  createdAt: string
}

export function PackageLibrary() {
  const [packages, setPackages] = useState<PackageRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/packages?limit=30')
      if (res.ok) {
        const data = await res.json()
        setPackages(data.packages || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={load} className="btn btn-ghost h-9 px-3 text-xs border border-[#27272a]">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-[#71717a]">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-medium mb-2">No saved packages yet</p>
          <p className="text-sm text-[#71717a] mb-6">
            Generate content from the studio — every package is saved automatically.
          </p>
          <Link href="/content-studio/generate" className="btn btn-primary h-10">
            Go to Generate
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card p-5 hover:border-[#3f3f46] transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#71717a] mb-1">
                    {pkg.businessName} ·{' '}
                    {formatDistanceToNow(new Date(pkg.createdAt), { addSuffix: true })}
                  </div>
                  <div className="font-medium text-[15px] line-clamp-2">{pkg.topic}</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {pkg.platforms.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272a] text-[#a1a1aa]"
                      >
                        {getPlatformLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/content-studio/generate?package=${pkg.id}`}
                  className="btn btn-secondary h-8 px-3 text-xs shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open &amp; copy
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}