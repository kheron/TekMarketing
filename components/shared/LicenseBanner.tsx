'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'

interface LicenseConfig {
  licenseTier: string
  licenseBlocked: boolean
  licenseMessage: string | null
  productUrl: string
  contactEmail: string
}

export function LicenseBanner() {
  const [config, setConfig] = useState<LicenseConfig | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {})
  }, [])

  if (!config || dismissed) return null

  const isBlocked = config.licenseBlocked
  const isWarning =
    !isBlocked && config.licenseTier === 'open-core-ack' && config.licenseMessage

  if (!isBlocked && !isWarning) return null

  return (
    <div
      className={`shrink-0 px-4 py-3 border-b flex items-start gap-3 text-sm ${
        isBlocked
          ? 'bg-red-950/40 border-red-900/50 text-red-100'
          : 'bg-amber-950/30 border-amber-900/40 text-amber-100'
      }`}
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">
          {isBlocked ? 'License required — agent features disabled' : 'Open Core personal use'}
        </div>
        <p className="text-xs mt-1 opacity-90 leading-relaxed">
          {config.licenseMessage ??
            'Commercial production requires a TEKHERO license.'}
        </p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          <Link href={config.productUrl} className="underline hover:no-underline">
            View plans
          </Link>
          <a
            href={`mailto:${config.contactEmail}`}
            className="underline hover:no-underline"
          >
            {config.contactEmail}
          </a>
        </div>
      </div>
      {!isBlocked && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}