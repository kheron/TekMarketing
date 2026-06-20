import Link from 'next/link'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { PackageLibrary } from '@/components/studio/PackageLibrary'

export default function PackagesPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Saved packages"
        description="Every generated package is saved here. Open any package to copy posts for each platform."
      />
      <div className="mb-6">
        <Link href="/content-studio/generate" className="text-sm text-blue-400 hover:underline">
          + Create new package
        </Link>
      </div>
      <PackageLibrary />
    </div>
  )
}