'use client'

import { TekheroFooter } from '@/components/shared/TekheroFooter'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Building2,
  Clapperboard,
  Settings,
  ChevronDown,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  PauseCircle,
  Sparkles,
  FolderOpen,
  X,
} from 'lucide-react'
import { useMobileNav } from '@/components/dashboard/MobileNavProvider'

const contentStudioItems = [
  { href: '/content-studio/generate', label: 'Generate & Copy', icon: Sparkles },
  { href: '/content-studio/packages', label: 'Saved Packages', icon: FolderOpen },
  { href: '/content-studio/approvals', label: 'Agent Approvals', icon: CheckCircle },
  { href: '/content-studio/posts', label: 'Agent Posts', icon: FileText },
  { href: '/content-studio/activity', label: 'Activity', icon: Clock },
  { href: '/content-studio/calendar', label: 'Calendar', icon: Calendar },
]

const mainNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/businesses', label: 'Businesses', icon: Building2 },
]

function isContentStudioPath(pathname: string) {
  return pathname.startsWith('/content-studio')
}

function SidebarNav({
  pathname,
  studioOpen,
  setStudioOpen,
  onNavigate,
}: {
  pathname: string
  studioOpen: boolean
  setStudioOpen: (open: boolean | ((value: boolean) => boolean)) => void
  onNavigate?: () => void
}) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setStudioOpen((open) => !open)}
            className={`sidebar-link w-full ${isContentStudioPath(pathname) ? 'active' : ''}`}
          >
            <Clapperboard className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Content Studio</span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform ${studioOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {studioOpen && (
            <div className="mt-1 ml-3 pl-3 border-l border-[#27272a] space-y-0.5">
              {contentStudioItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`sidebar-sublink ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Link
            href="/settings"
            onClick={onNavigate}
            className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-[#27272a] space-y-3">
        <div className="px-1">
          <TekheroFooter variant="compact" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111113] border border-[#27272a]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] text-[#a1a1aa]">Agent • Daily 07:00 UTC</span>
        </div>
        <button
          type="button"
          onClick={() => alert('Pause scheduled runs coming soon. Manual cycles still work.')}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#111113] border border-[#27272a] text-[11px] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          Pause Agent
        </button>
      </div>
    </>
  )
}

function SidebarBrandContent() {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
        <span className="font-bold text-sm tracking-[-0.5px]">TM</span>
      </div>
      <div className="min-w-0">
        <div className="font-semibold tracking-[-0.3px] text-[15px] leading-none truncate">
          TekMarketing
        </div>
        <div className="text-[9px] text-[#52525b] mt-0.5 tracking-widest uppercase truncate">
          Open Core · TEKHERO
        </div>
      </div>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { open, setOpen } = useMobileNav()
  const [studioOpen, setStudioOpen] = useState(isContentStudioPath(pathname))

  useEffect(() => {
    if (isContentStudioPath(pathname)) {
      setStudioOpen(true)
    }
  }, [pathname])

  const closeMobile = () => setOpen(false)

  return (
    <>
      <aside className="app-sidebar hidden lg:flex w-[260px] shrink-0 border-r border-[#27272a] bg-[#09090b]/95 backdrop-blur flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-[#27272a]">
          <SidebarBrandContent />
        </div>
        <SidebarNav
          pathname={pathname}
          studioOpen={studioOpen}
          setStudioOpen={setStudioOpen}
        />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={closeMobile}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(300px,88vw)] max-w-full flex flex-col border-r border-[#27272a] bg-[#09090b] shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[#27272a]">
              <SidebarBrandContent />
              <button
                type="button"
                onClick={closeMobile}
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="-mt-px flex flex-1 flex-col min-h-0">
              <SidebarNav
                pathname={pathname}
                studioOpen={studioOpen}
                setStudioOpen={setStudioOpen}
                onNavigate={closeMobile}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}