'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Plus, Check, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface Business {
  id: string
  companyName: string
  voiceDescription: string
  preferredPlatforms: string
  isActive: boolean
  updatedAt: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/businesses')
      if (res.ok) {
        const data = await res.json()
        setBusinesses(data.businesses || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function activate(id: string) {
    try {
      const res = await fetch(`/api/businesses/${id}/activate`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to switch')
      toast.success('Active business updated')
      await load()
    } catch {
      toast.error('Failed to switch business')
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/businesses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Business profile deleted')
      await load()
    } catch {
      toast.error('Failed to delete business')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <PageHeader
        eyebrow="MULTI-BRAND"
        title="Businesses"
        description="Manage multiple brand profiles. The agent uses whichever business is marked active for planning cycles."
        action={
          <Link href="/businesses/new" className="btn btn-primary h-10 px-5 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Business
          </Link>
        }
      />

      {isLoading ? (
        <div className="card p-12 text-center text-[#71717a]">Loading businesses...</div>
      ) : businesses.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-10 h-10 mx-auto text-[#3f3f46] mb-4" />
          <div className="font-medium text-lg mb-2">No business profiles yet</div>
          <p className="text-sm text-[#71717a] mb-6 max-w-sm mx-auto">
            Create your first profile so the agent knows your brand voice, audience, and goals.
          </p>
          <Link href="/businesses/new" className="btn btn-primary">
            Create First Business
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className={`card p-6 transition-colors ${biz.isActive ? 'border-blue-500/30 bg-blue-500/5' : 'hover:border-[#3f3f46]'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{biz.companyName}</h3>
                    {biz.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#71717a] line-clamp-2">{biz.voiceDescription}</p>
                  <div className="text-xs text-[#52525b] mt-2">{biz.preferredPlatforms}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!biz.isActive && (
                    <button onClick={() => activate(biz.id)} className="btn btn-secondary h-9 px-3 text-xs">
                      Set Active
                    </button>
                  )}
                  <Link href={`/businesses/${biz.id}`} className="btn btn-ghost h-9 px-3 text-xs border border-[#27272a]">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(biz.id, biz.companyName)}
                    className="btn btn-ghost h-9 px-3 text-xs border border-[#27272a] text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}