import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContentList } from '@/components/content/ContentList'

export default function PostsPage() {
  return (
    <div className="dashboard-page max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Agent posts"
        description="Single-platform drafts from the autonomous planning cycle (X, LinkedIn). For multi-platform copy-paste packages, use Generate."
      />
      <ContentList
        title="All Posts"
        description="Drafts, pending approvals, and published social content."
        formats={['POST', 'THREAD', 'CAPTION', 'NEWSLETTER', 'BLOG_IDEA']}
        emptyTitle="No posts yet"
        emptyDescription="Run a planning cycle from the Dashboard to generate post proposals for your active business."
      />
    </div>
  )
}