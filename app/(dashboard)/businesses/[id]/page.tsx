'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { BusinessForm } from '@/components/business/BusinessForm'
import type { BrandContextInput } from '@/lib/agent/types'

export default function EditBusinessPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [initialData, setInitialData] = useState<Partial<BrandContextInput> | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/businesses/${id}`)
      if (res.ok) {
        const { business } = await res.json()
        setInitialData(business)
      }
    }
    load()
  }, [id])

  if (!initialData) {
    return <div className="p-12 text-center text-[#71717a]">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <PageHeader eyebrow="EDIT PROFILE" title={initialData.companyName || 'Business Profile'} description="Update brand context. Changes apply to the next planning cycle." />
      <BusinessForm businessId={id} initialData={initialData} onSaved={() => router.push('/businesses')} />
    </div>
  )
}