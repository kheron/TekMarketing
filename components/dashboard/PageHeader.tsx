interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        {eyebrow && (
          <div className="uppercase tracking-[2px] text-[10px] text-[#71717a] mb-2">{eyebrow}</div>
        )}
        <h1 className="text-3xl font-semibold tracking-[-1px]">{title}</h1>
        {description && <p className="text-[#71717a] mt-1.5 text-sm max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
