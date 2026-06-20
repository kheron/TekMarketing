import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { LicenseBanner } from '@/components/shared/LicenseBanner'
import { TekheroFooter } from '@/components/shared/TekheroFooter'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <LicenseBanner />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <TekheroFooter variant="full" />
      </div>
    </div>
  )
}