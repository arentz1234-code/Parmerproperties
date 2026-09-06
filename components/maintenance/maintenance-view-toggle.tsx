'use client'

import Link from 'next/link'
import { LayoutList, Columns3 } from 'lucide-react'
import { cn } from 'cn'

interface Props {
  view: string
  tab: string
}

export function MaintenanceViewToggle({ view, tab }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/40">
      <Link
        href={`/manager/maintenance?tab=${tab}&view=table`}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
          view === 'table'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutList className="size-3.5" />
        Table
      </Link>
      <Link
        href={`/manager/maintenance?tab=${tab}&view=kanban`}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
          view === 'kanban'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Columns3 className="size-3.5" />
        Kanban
      </Link>
    </div>
  )
}
