'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BrandContextSchema, type BrandContextInput } from '@/lib/agent/types'
import { toast } from 'sonner'
import { Save, Loader2, Globe } from 'lucide-react'

interface BusinessFormProps {
  initialData?: Partial<BrandContextInput>
  businessId?: string
  onSaved?: () => void
}

export function BusinessForm({ initialData, businessId, onSaved }: BusinessFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')

  const form = useForm<BrandContextInput>({
    resolver: zodResolver(BrandContextSchema),
    defaultValues: {
      companyName: '',
      voiceDescription: '',
      targetAudience: '',
      productsServices: '',
      keyDifferentiators: '',
      primaryGoals: '',
      contentPillars: '',
      preferredPlatforms: 'X,LinkedIn,Instagram,Email',
      toneKeywords: '',
      doNotSay: '',
      industry: '',
      website: '',
      visualStyle: '',
      additionalContext: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        companyName: initialData.companyName ?? '',
        voiceDescription: initialData.voiceDescription ?? '',
        targetAudience: initialData.targetAudience ?? '',
        productsServices: initialData.productsServices ?? '',
        keyDifferentiators: initialData.keyDifferentiators ?? '',
        primaryGoals: initialData.primaryGoals ?? '',
        contentPillars: initialData.contentPillars ?? '',
        preferredPlatforms: initialData.preferredPlatforms ?? 'X,LinkedIn,Instagram,Email',
        toneKeywords: initialData.toneKeywords ?? '',
        doNotSay: initialData.doNotSay ?? '',
        industry: initialData.industry ?? '',
        website: initialData.website ?? '',
        visualStyle: initialData.visualStyle ?? '',
        additionalContext: initialData.additionalContext ?? '',
      })
    }
  }, [initialData, form])

  const analyzeWebsite = async () => {
    let url = websiteUrl.trim()
    if (!url) {
      toast.error('Please enter a website URL')
      return
    }
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/brand/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      form.reset(data.data)
      toast.success('Website analyzed — review and adjust as needed.')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Analysis failed'
      toast.error(message.includes('XAI') ? 'xAI API Error' : 'Could not analyze website', {
        description: message,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onSubmit = async (values: BrandContextInput) => {
    setIsSaving(true)
    try {
      const url = businessId ? `/api/businesses/${businessId}` : '/api/businesses'
      const method = businessId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, setActive: !businessId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      toast.success(businessId ? 'Business profile updated' : 'Business profile created')
      onSaved?.()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8 p-5 rounded-2xl border border-[#27272a] bg-[#111113]">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-5 h-5 text-[#3b82f6]" />
          <div className="font-medium">Import from website</div>
        </div>
        <p className="text-sm text-[#71717a] mb-3">
          Paste a URL and the agent will pre-fill brand context from the homepage.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeWebsite()}
            placeholder="yourcompany.com"
            className="input flex-1"
          />
          <button
            onClick={analyzeWebsite}
            disabled={isAnalyzing || !websiteUrl.trim()}
            className="btn btn-primary px-5 disabled:opacity-60 whitespace-nowrap"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              'Analyze with AI'
            )}
          </button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <div className="text-sm font-medium">Core Identity</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Company / Brand Name</label>
              <input {...form.register('companyName')} className="input w-full" placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Industry</label>
              <input {...form.register('industry')} className="input w-full" placeholder="SaaS, E-commerce, etc." />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Website</label>
            <input {...form.register('website')} className="input w-full" placeholder="https://yourcompany.com" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Brand Voice &amp; Personality</label>
            <textarea {...form.register('voiceDescription')} rows={4} className="textarea w-full" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-medium">Audience &amp; Offer</div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Target Audience</label>
            <textarea {...form.register('targetAudience')} rows={3} className="textarea w-full" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Products / Services</label>
            <textarea {...form.register('productsServices')} rows={2} className="textarea w-full" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Key Differentiators</label>
            <textarea {...form.register('keyDifferentiators')} rows={2} className="textarea w-full" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-medium">Strategy &amp; Guardrails</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Primary Goals</label>
              <textarea {...form.register('primaryGoals')} rows={3} className="textarea w-full" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Preferred Platforms</label>
              <input {...form.register('preferredPlatforms')} className="input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Content Pillars</label>
            <textarea {...form.register('contentPillars')} rows={2} className="textarea w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Tone Keywords</label>
              <input {...form.register('toneKeywords')} className="input w-full" placeholder="professional, witty, direct" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Visual Style</label>
              <input {...form.register('visualStyle')} className="input w-full" placeholder="clean, minimal, bold typography" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#71717a] mb-1.5">Never Say / Never Do</label>
            <textarea {...form.register('doNotSay')} rows={2} className="textarea w-full" />
          </div>
        </section>

        <div className="pt-4 border-t border-[#27272a] flex justify-end">
          <button type="submit" disabled={isSaving} className="btn btn-primary h-11 px-8 flex items-center gap-2 disabled:opacity-60">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {businessId ? 'Save Changes' : 'Create Business Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
