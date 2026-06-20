'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  CheckCircle, 
  Users, 
  BarChart3,
  PauseCircle,
  Clock
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/approvals', label: 'Approvals', icon: CheckCircle },
  { href: '/activity', label: 'Activity', icon: Clock },
  { href: '/brand', label: 'Brand & Strategy', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1 text-sm">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export function AgentStatusBar() {
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111113] border border-[#27272a]">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[#a1a1aa]">Scheduled • Daily 07:00 UTC</span>
      </div>
      <button 
        onClick={() => alert("Pause scheduled runs coming soon. Manual cycles still work.")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111113] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] hover:border-[#3f3f46] transition-colors"
      >
        <PauseCircle className="w-3.5 h-3.5" />
        <span>Pause Agent</span>
      </button>
    </div>
  )
}
