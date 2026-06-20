'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import type { SocialPlatform } from '@/lib/agent/types'
import { getPlatformLabel } from '@/lib/constants/platforms'

interface RegenerateDialogProps {
  platform: SocialPlatform
  open: boolean
  onClose: () => void
  onRegenerate: (feedback: string) => Promise<void>
}

export function RegenerateDialog({
  platform,
  open,
  onClose,
  onRegenerate,
}: RegenerateDialogProps) {
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!open) return null

  async function handleSubmit() {
    if (!feedback.trim()) return
    setIsLoading(true)
    try {
      await onRegenerate(feedback.trim())
      setFeedback('')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Regenerate {getPlatformLabel(platform)}</h3>
        <p className="mt-1 text-sm text-[#71717a]">
          Tell the AI what to change — tone, length, angle, or specifics to add.
        </p>
        <textarea
          className="textarea w-full mt-4 min-h-[100px]"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Shorter hook, more professional tone, stronger CTA..."
          disabled={isLoading}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={isLoading} className="btn btn-secondary h-9">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !feedback.trim()}
            className="btn btn-primary h-9"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}