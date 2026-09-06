'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, Inbox } from 'lucide-react'
import { cn } from 'cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface Column<T> {
  key: string
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface RowAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  rowActions?: (row: T) => RowAction[]
  emptyState?: React.ReactNode
  loading?: boolean
  className?: string
}

type SortDirection = 'asc' | 'desc' | null

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp size={13} className="text-gray-700" />
  if (direction === 'desc') return <ChevronDown size={13} className="text-gray-700" />
  return <ChevronsUpDown size={13} className="text-gray-400" />
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
        <Inbox size={22} className="text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600">No results found</p>
      <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
    </div>
  )
}

function SkeletonRows({ columns, count = 6 }: { columns: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </td>
          ))}
          <td className="px-4 py-3 w-10">
            <Skeleton className="h-4 w-6" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  rowActions,
  emptyState,
  loading = false,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey !== key) {
        setSortKey(key)
        setSortDirection('asc')
      } else if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    },
    [sortKey, sortDirection]
  )

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data
    const q = searchQuery.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false
        return String(val).toLowerCase().includes(q)
      })
    )
  }, [data, searchQuery])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDirection) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      const aStr = String(aVal ?? '').toLowerCase()
      const bStr = String(bVal ?? '').toLowerCase()
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
      }
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filtered, sortKey, sortDirection])

  const showActions = !!rowActions

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
      )}

      <div className="w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          {/* Sticky header */}
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                    col.className
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon direction={sortKey === col.key ? sortDirection : null} />
                    )}
                  </span>
                </th>
              ))}
              {showActions && <th scope="col" className="px-4 py-3 w-10" />}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <SkeletonRows columns={columns.length} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)}>
                  {emptyState ?? <DefaultEmptyState />}
                </td>
              </tr>
            ) : (
              sorted.map((row, rowIndex) => {
                const actions = rowActions ? rowActions(row) : []
                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'transition-colors',
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                      onRowClick && 'cursor-pointer hover:bg-blue-50/60'
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn('px-4 py-3 text-gray-700 align-middle', col.className)}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] as React.ReactNode) ?? (
                              <span className="text-gray-300">—</span>
                            )}
                      </td>
                    ))}
                    {showActions && (
                      <td
                        className="px-4 py-3 text-right align-middle w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-gray-400 hover:text-gray-600"
                                />
                              }
                            >
                              <MoreHorizontal size={15} />
                              <span className="sr-only">Row actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {actions.map((action, i) => (
                                <DropdownMenuItem
                                  key={i}
                                  variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                                  onClick={action.onClick}
                                >
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && sorted.length > 0 && (
        <p className="text-xs text-gray-400 px-1">
          Showing {sorted.length} of {data.length} {data.length === 1 ? 'result' : 'results'}
        </p>
      )}
    </div>
  )
}
