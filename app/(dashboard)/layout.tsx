import { AppSidebar } from '@/components/dashboard/AppSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  )
}