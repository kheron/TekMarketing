import { Suspense } from 'react'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { StudioGenerate } from '@/components/studio/StudioGenerate'

export default function GeneratePage() {
  return (
    <div className="dashboard-page max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Generate & copy"
        description="Get topic ideas, generate platform-ready posts, and copy-paste into LinkedIn, X, Instagram, TikTok, or YouTube."
      />
      <Suspense fallback={<div className="card p-12 text-center text-[#71717a]">Loading...</div>}>
        <StudioGenerate />
      </Suspense>
    </div>
  )
}