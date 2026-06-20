import { PageHeader } from '@/components/dashboard/PageHeader'
import { ApprovalsPanel } from '@/components/content/ApprovalsPanel'

export default function ApprovalsPage() {
  return (
    <div className="dashboard-page max-w-6xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Approvals"
        description="Review agent proposals side-by-side with reasoning. Approve, reject, or regenerate with feedback."
      />
      <ApprovalsPanel />
    </div>
  )
}