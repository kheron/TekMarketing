'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/PageHeader'

interface CalendarItem {
  id: string
  platform: string
  format: string
  title: string | null
  body: string
  status: string
  scheduledFor: string | null
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([])
  const [month, setMonth] = useState(new Date())

  useEffect(() => {
    fetch('/api/content?limit=100')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
  }, [])

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  })

  const scheduled = items.filter(
    (i) =>
      i.scheduledFor &&
      ['APPROVED', 'SCHEDULED', 'READY_TO_PUBLISH', 'PUBLISHED'].includes(i.status)
  )

  return (
    <div className="dashboard-page max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="CONTENT STUDIO"
        title="Calendar"
        description="Scheduled and approved content across your marketing calendar."
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="btn btn-ghost h-9 w-9 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-semibold">{format(month, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="btn btn-ghost h-9 w-9 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-[#52525b] py-2">
            {d}
          </div>
        ))}
        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const dayItems = scheduled.filter(
            (item) => item.scheduledFor && isSameDay(new Date(item.scheduledFor), day)
          )
          return (
            <div
              key={day.toISOString()}
              className={`card min-h-[88px] p-2 ${isSameDay(day, new Date()) ? 'border-blue-500/40' : ''}`}
            >
              <div className="text-xs text-[#71717a] mb-1">{format(day, 'd')}</div>
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 truncate mb-0.5"
                  title={item.title || item.body}
                >
                  {item.platform}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-medium mb-4">Upcoming scheduled content</h3>
        {scheduled.length === 0 ? (
          <p className="text-sm text-[#71717a]">Approve content to see it on the calendar.</p>
        ) : (
          <div className="space-y-3">
            {scheduled
              .sort(
                (a, b) =>
                  new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime()
              )
              .slice(0, 10)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm border-b border-[#27272a] pb-3 last:border-0">
                  <div>
                    <span className="text-[#71717a] text-xs mr-2">
                      {item.scheduledFor
                        ? format(new Date(item.scheduledFor), 'MMM d, h:mm a')
                        : '—'}
                    </span>
                    <span className="font-medium">{item.title || item.body.slice(0, 60)}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#27272a]">{item.platform}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}