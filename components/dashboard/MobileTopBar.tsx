'use client'

import { Menu } from 'lucide-react'
import { useMobileNav } from '@/components/dashboard/MobileNavProvider'

export function MobileTopBar() {
  const { toggle } = useMobileNav()

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur">
      <button
        type="button"
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272a] bg-[#111113] text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[15px] tracking-[-0.3px] truncate">TekMarketing</div>
        <div className="text-[9px] text-[#52525b] tracking-widest uppercase truncate">
          Open Core · TEKHERO
        </div>
      </div>
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
        <span className="font-bold text-xs tracking-[-0.5px]">TM</span>
      </div>
    </header>
  )
}