'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lightbulb, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { ContentEpisodePayload, SocialPlatform } from '@/lib/agent/types'
import { PLATFORMS } from '@/lib/constants/platforms'
import { ContentPackageView } from '@/components/studio/ContentPackageView'

interface Business {
  id: string
  companyName: string
  isActive: boolean
}

interface TopicSuggestion {
  topic: string
  angle: string
  whyNow: string
}

interface SavedPackage {
  id: string
  topic: string
  platforms: SocialPlatform[]
  strategyNote: string
  agentReasoning: string
  content: ContentEpisodePayload['content']
  createdAt: string
  businessId: string
}

export function StudioGenerate() {
  const searchParams = useSearchParams()
  const packageParam = searchParams.get('package')

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [brandId, setBrandId] = useState('')
  const [topic, setTopic] = useState('')
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    'linkedin',
    'x',
    'instagram',
  ])
  const [activeProvider, setActiveProvider] = useState('xai')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecommending, setIsRecommending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([])
  const [result, setResult] = useState<ContentEpisodePayload | null>(null)
  const [packageId, setPackageId] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const loadPackage = useCallback(async (id: string) => {
    const res = await fetch(`/api/packages/${id}`)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Could not load package')
      return
    }
    const data = await res.json()
    const pkg = data.package as SavedPackage
    setBrandId(pkg.businessId)
    setTopic(pkg.topic)
    setPlatforms(pkg.platforms)
    setPackageId(pkg.id)
    setSavedAt(pkg.createdAt)
    setResult({
      platforms: pkg.platforms,
      strategyNote: pkg.strategyNote,
      agentReasoning: pkg.agentReasoning,
      content: pkg.content,
    })
    setSuggestions([])
  }, [])

  useEffect(() => {
    fetch('/api/businesses')
      .then((r) => r.json())
      .then((d) => {
        const list = d.businesses || []
        setBusinesses(list)
        if (!packageParam) {
          const active = list.find((b: Business) => b.isActive) || list[0]
          if (active) setBrandId(active.id)
        }
      })
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setActiveProvider(d.activeProvider || 'xai'))
  }, [packageParam])

  useEffect(() => {
    if (packageParam) loadPackage(packageParam)
  }, [packageParam, loadPackage])

  function togglePlatform(id: SocialPlatform) {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleRecommendTopics() {
    if (!brandId) {
      toast.error('Select a business first')
      return
    }
    setIsRecommending(true)
    setSuggestions([])
    try {
      const res = await fetch('/api/generate/recommend-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandContextId: brandId, provider: activeProvider }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to suggest topics')
      setSuggestions(data.suggestions || [])
      toast.success(`${data.suggestions?.length || 0} topic ideas ready`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not suggest topics')
    } finally {
      setIsRecommending(false)
    }
  }

  function applySuggestion(s: TopicSuggestion) {
    setTopic(s.topic)
    setSuggestions([])
    toast.success('Topic applied — edit if needed, then generate')
  }

  async function handleGenerate() {
    if (!brandId) {
      toast.error('Select a business first')
      return
    }
    if (!topic.trim()) {
      toast.error('Enter a topic or use Suggest topics')
      return
    }
    if (platforms.length === 0) {
      toast.error('Select at least one platform')
      return
    }

    setIsGenerating(true)
    setResult(null)
    setPackageId(null)
    setSavedAt(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandContextId: brandId,
          topic: topic.trim(),
          platforms,
          provider: activeProvider,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setResult({
        platforms: data.package.platforms,
        strategyNote: data.package.strategyNote,
        agentReasoning: data.package.agentReasoning,
        content: data.package.content,
      })
      setPackageId(data.package.id)
      setSavedAt(data.package.createdAt)
      window.history.replaceState(
        null,
        '',
        `/content-studio/generate?package=${data.package.id}`
      )
      toast.success('Package generated and saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRegenerate(platform: SocialPlatform, feedback: string) {
    if (!packageId) return
    setIsRegenerating(true)
    try {
      const res = await fetch('/api/generate/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, platform, feedback, provider: activeProvider }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Regeneration failed')
      setResult({
        platforms: data.package.platforms,
        strategyNote: data.package.strategyNote,
        agentReasoning: data.package.agentReasoning,
        content: data.package.content,
      })
      toast.success(`${platform} content updated`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Regeneration failed')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="card p-4 border-blue-500/20 bg-blue-500/5 text-sm text-[#a1a1aa]">
        <strong className="text-[#f4f4f5]">Workflow:</strong> Pick a topic → select platforms →
        generate → copy each post and paste into your social apps. Packages auto-save to{' '}
        <Link href="/content-studio/packages" className="text-blue-400 hover:underline">
          your library
        </Link>
        .
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#71717a]">1 · Business</div>
          <select
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value)
              setSuggestions([])
            }}
            className="input w-full"
          >
            {businesses.length === 0 && <option value="">No businesses — create one first</option>}
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs uppercase tracking-widest text-[#71717a]">2 · Topic</div>
            <button
              type="button"
              onClick={handleRecommendTopics}
              disabled={isRecommending || !brandId}
              className="btn btn-secondary h-8 px-3 text-xs disabled:opacity-50"
            >
              {isRecommending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lightbulb className="w-3.5 h-3.5" />
              )}
              Suggest topics
            </button>
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What should this content package be about? Or click Suggest topics for AI ideas based on your brand."
            className="input w-full min-h-[88px]"
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="card p-5 space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#71717a]">Suggested topics</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applySuggestion(s)}
                className="text-left p-4 rounded-xl border border-[#27272a] hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors"
              >
                <div className="text-sm font-medium text-[#f4f4f5] mb-1">{s.angle}</div>
                <div className="text-xs text-[#a1a1aa] line-clamp-2 mb-2">{s.topic}</div>
                <div className="text-[10px] text-[#52525b]">{s.whyNow}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div className="text-xs uppercase tracking-widest text-[#71717a]">3 · Platforms</div>
        <p className="text-xs text-[#52525b] -mt-2">
          Select where you plan to post — content is formatted for copy-paste into each app.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => {
            const selected = platforms.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePlatform(p.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selected
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <div className="text-sm font-medium">{p.shortLabel}</div>
                <div className="text-[10px] text-[#71717a] mt-0.5 line-clamp-2">{p.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn btn-primary h-11 px-8"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Generate &amp; save package
      </button>

      {isGenerating && (
        <div className="card p-12 text-center text-[#71717a]">
          Building your multi-platform package… usually 30–60 seconds.
        </div>
      )}

      {result && (
        <ContentPackageView
          payload={result}
          topic={topic}
          packageId={packageId}
          savedAt={savedAt}
          onRegenerate={packageId ? handleRegenerate : undefined}
          isRegenerating={isRegenerating}
        />
      )}
    </div>
  )
}
