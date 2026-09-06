import { cn } from 'cn'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode // action buttons
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-5 mb-6 border-b border-gray-200 sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  )
}
