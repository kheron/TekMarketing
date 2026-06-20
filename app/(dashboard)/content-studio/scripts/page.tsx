import { PageHeader } from '@/components/dashboard/PageHeader'
import { ContentList } from '@/components/content/ContentList'

export default function VideoScriptsPage() {
  return (
    <div className="dashboard-page max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Video Scripts"
        description="Short-form and long-form video scripts with hooks, beats, and CTAs tailored to your brand."
      />
      <ContentList
        title="Video Scripts"
        description="Scripts ready for review, filming, or editing."
        formats={['VIDEO_SCRIPT']}
        emptyTitle="No video scripts yet"
        emptyDescription="The agent will propose video scripts during planning cycles when video is part of your content strategy."
      />
    </div>
  )
}