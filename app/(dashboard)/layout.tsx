import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { MobileNavProvider } from '@/components/dashboard/MobileNavProvider'
import { MobileTopBar } from '@/components/dashboard/MobileTopBar'
import { LicenseBanner } from '@/components/shared/LicenseBanner'
import { TekheroFooter } from '@/components/shared/TekheroFooter'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-[#09090b] flex flex-col lg:flex-row">
        <AppSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <MobileTopBar />
          <LicenseBanner />
          <main className="flex-1 overflow-x-hidden">{children}</main>
          <TekheroFooter variant="full" />
        </div>
      </div>
    </MobileNavProvider>
  )
}