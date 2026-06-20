'use client'

import { useState } from 'react'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import type { ContentEpisodePayload, SocialPlatform } from '@/lib/agent/types'
import { getPlatformLabel } from '@/lib/constants/platforms'
import {
  formatFullPackage,
  formatPlatformForCopy,
  getPlatformCopyLabel,
} from '@/lib/content/format-package'
import { CopyButton } from '@/components/shared/CopyButton'
import { DownloadTextButton } from '@/components/shared/DownloadTextButton'
import { RegenerateDialog } from '@/components/studio/RegenerateDialog'

function CopyBlock({
  label,
  content,
  mono = false,
}: {
  label: string
  content: string
  mono?: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-widest text-[#71717a]">{label}</p>
        <CopyButton text={content} label="Copy" variant="ghost" iconOnly />
      </div>
      <pre
        className={`max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#27272a] bg-[#09090b] p-4 text-sm text-[#e4e4e7] ${
          mono ? 'font-mono text-xs' : 'font-sans'
        }`}
      >
        {content}
      </pre>
    </div>
  )
}

function SocialPostPanel({
  platform,
  text,
  hashtags,
}: {
  platform: SocialPlatform
  text: string
  hashtags?: string[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <CopyButton text={text} label={getPlatformCopyLabel(platform)} variant="primary" />
      </div>
      <CopyBlock label="Ready to paste" content={text} />
      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          {hashtags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#27272a] text-[#a1a1aa]">
              #{tag.replace(/^#/, '')}
            </span>
          ))}
          <CopyButton
            text={hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')}
            label="Copy hashtags"
            variant="ghost"
          />
        </div>
      )}
    </div>
  )
}

function PlatformPanel({
  platform,
  payload,
}: {
  platform: SocialPlatform
  payload: ContentEpisodePayload
}) {
  const copyText = formatPlatformForCopy(platform, payload.content)
  const content = payload.content[platform]
  if (!content || !copyText) return null

  if (platform === 'x' || platform === 'linkedin' || platform === 'facebook') {
    const social = content as NonNullable<typeof payload.content.x>
    return (
      <SocialPostPanel
        platform={platform}
        text={copyText}
        hashtags={social.hashtags}
      />
    )
  }

  if (platform === 'instagram') {
    const ig = content as NonNullable<typeof payload.content.instagram>
    return (
      <div className="space-y-4">
        <CopyButton text={copyText} label={getPlatformCopyLabel(platform)} variant="primary" />
        <CopyBlock label="Caption" content={copyText} />
        {ig.reelScript && (
          <CopyBlock
            label="Reel script"
            content={`${ig.reelScript.hook}\n\n${ig.reelScript.body}\n\n${ig.reelScript.cta}`}
          />
        )}
      </div>
    )
  }

  if (platform === 'tiktok') {
    const tt = content as NonNullable<typeof payload.content.tiktok>
    return (
      <div className="space-y-4">
        <CopyButton text={copyText} label={getPlatformCopyLabel(platform)} variant="primary" />
        <CopyBlock label="Full TikTok package" content={copyText} />
        <CopyBlock label="Caption only" content={tt.caption} />
      </div>
    )
  }

  if (platform === 'youtube_short') {
    const yt = content as NonNullable<typeof payload.content.youtube_short>
    const script = `${yt.script.hook}\n\n${yt.script.body}\n\n${yt.script.cta}`
    return (
      <div className="space-y-4">
        <CopyButton text={copyText} label={getPlatformCopyLabel(platform)} variant="primary" />
        <div>
          <p className="text-xs uppercase tracking-widest text-[#71717a] mb-2">Title options</p>
          <div className="flex flex-wrap gap-2">
            {yt.youtube.titleOptions.map((title) => (
              <span
                key={title}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-[#27272a] border border-[#3f3f46]"
              >
                {title}
                <CopyButton text={title} variant="ghost" iconOnly />
              </span>
            ))}
          </div>
        </div>
        <CopyBlock label="Script" content={script} />
        <CopyBlock label="Description" content={yt.youtube.description} />
        <CopyButton text={yt.youtube.tags.join(', ')} label="Copy tags" variant="secondary" />
      </div>
    )
  }

  if (platform === 'youtube_long') {
    const yt = content as NonNullable<typeof payload.content.youtube_long>
    return (
      <div className="space-y-4">
        <CopyButton text={copyText} label={getPlatformCopyLabel(platform)} variant="primary" />
        <CopyBlock label="Full script" content={yt.script} />
        <CopyBlock label="Description" content={yt.youtube.description} />
      </div>
    )
  }

  return <CopyBlock label="Content" content={copyText} />
}

interface ContentPackageViewProps {
  payload: ContentEpisodePayload
  topic: string
  packageId?: string | null
  savedAt?: string | null
  onRegenerate?: (platform: SocialPlatform, feedback: string) => Promise<void>
  isRegenerating?: boolean
}

export function ContentPackageView({
  payload,
  topic,
  packageId,
  savedAt,
  onRegenerate,
  isRegenerating,
}: ContentPackageViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | SocialPlatform>('overview')
  const [regenerateOpen, setRegenerateOpen] = useState(false)
  const fullPackage = formatFullPackage(topic, payload)

  const tabs: Array<{ id: 'overview' | SocialPlatform; label: string }> = [
    { id: 'overview', label: 'Overview' },
    ...payload.platforms.map((p) => ({
      id: p as 'overview' | SocialPlatform,
      label: getPlatformLabel(p),
    })),
  ]

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-[#27272a] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">Content package</h3>
            {packageId && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <p className="text-sm text-[#71717a] line-clamp-2">{topic}</p>
          {savedAt && (
            <p className="text-[10px] text-[#52525b] mt-1">
              {format(new Date(savedAt), 'MMM d, yyyy · h:mm a')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={fullPackage} label="Copy full package" variant="primary" />
          <DownloadTextButton
            text={fullPackage}
            filename={`tekmarketing-${topic.slice(0, 40).replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'package'}`}
            label="Download .txt"
          />
        </div>
      </div>

      <div className="px-6 pt-4 flex flex-wrap gap-2 border-b border-[#27272a] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/15 text-blue-300'
                : 'text-[#71717a] hover:bg-[#27272a] hover:text-[#f4f4f5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {activeTab !== 'overview' && onRegenerate && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setRegenerateOpen(true)}
              disabled={isRegenerating}
              className="btn btn-secondary h-9 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate with feedback
            </button>
          </div>
        )}

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#71717a] mb-2">Strategy</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{payload.strategyNote}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs uppercase tracking-widest text-[#71717a] mb-2">Agent reasoning</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{payload.agentReasoning}</p>
            </div>
            <div className="xl:col-span-2">
              <p className="text-xs uppercase tracking-widest text-[#71717a] mb-3">
                Quick copy — one click per platform
              </p>
              <div className="flex flex-wrap gap-2">
                {payload.platforms.map((platform) => {
                  const text = formatPlatformForCopy(platform, payload.content)
                  if (!text) return null
                  return (
                    <CopyButton
                      key={platform}
                      text={text}
                      label={getPlatformCopyLabel(platform)}
                      variant="secondary"
                    />
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <PlatformPanel platform={activeTab} payload={payload} />
        )}
      </div>

      {activeTab !== 'overview' && onRegenerate && (
        <RegenerateDialog
          platform={activeTab}
          open={regenerateOpen}
          onClose={() => setRegenerateOpen(false)}
          onRegenerate={(feedback) => onRegenerate(activeTab, feedback)}
        />
      )}
    </div>
  )
}
