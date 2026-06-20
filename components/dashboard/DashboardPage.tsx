interface DashboardPageProps {
  children: React.ReactNode
  className?: string
  maxWidth?: '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

const maxWidthClass: Record<NonNullable<DashboardPageProps['maxWidth']>, string> = {
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
}

export function DashboardPage({
  children,
  className = '',
  maxWidth = '7xl',
}: DashboardPageProps) {
  return (
    <div
      className={`dashboard-page w-full mx-auto ${maxWidthClass[maxWidth]} ${className}`.trim()}
    >
      {children}
    </div>
  )
}