interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <div className="uppercase tracking-[2px] text-[10px] text-[#71717a] mb-2">{eyebrow}</div>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-1px]">{title}</h1>
        {description && <p className="text-[#71717a] mt-1.5 text-sm max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0 w-full sm:w-auto">{action}</div>}
    </div>
  )
}
