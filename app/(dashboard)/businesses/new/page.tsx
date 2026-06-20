'use client'

import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { BusinessForm } from '@/components/business/BusinessForm'

export default function NewBusinessPage() {
  const router = useRouter()

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <PageHeader eyebrow="NEW PROFILE" title="Add Business" description="Define brand voice and strategy. This becomes the foundation for all agent-generated content." />
      <BusinessForm onSaved={() => router.push('/businesses')} />
    </div>
  )
}