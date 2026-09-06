'use client'

import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  Plus,
  Building2,
  Users,
  AlertTriangle,
  DollarSign,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { ManagerSidebarMobile } from '@/components/layout/manager-sidebar-mobile'

// Map path segments to readable page titles
const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  properties: 'Properties',
  units: 'Units',
  tenants: 'Tenants',
  owners: 'Owners',
  vendors: 'Vendors',
  payments: 'Payments',
  leases: 'Leases',
  accounting: 'Accounting',
  maintenance: 'Maintenance',
  inspections: 'Inspections',
  documents: 'Documents',
  tasks: 'Tasks',
  applications: 'Applications',
  leads: 'Leads',
  listings: 'Listings',
  communications: 'Messages',
  delinquency: 'Delinquency',
  reports: 'Reports',
  settings: 'Settings',
}

function usePageTitle(): string {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  // The last meaningful segment is usually the page name
  for (let i = segments.length - 1; i >= 0; i--) {
    const title = PAGE_TITLES[segments[i]]
    if (title) return title
  }
  return 'Manager Portal'
}

const QUICK_ADD_ITEMS = [
  { label: 'New Property', icon: Building2, href: '/manager/properties/new' },
  { label: 'New Tenant', icon: Users, href: '/manager/tenants/new' },
  { label: 'New Maintenance Request', icon: AlertTriangle, href: '/manager/maintenance/new' },
  { label: 'Record Payment', icon: DollarSign, href: '/manager/payments/record' },
]

export function ManagerTopbar() {
  const router = useRouter()
  const { data: session } = useSession()
  const pageTitle = usePageTitle()

  const user = session?.user
  const userName = user?.name ?? 'Manager'
  const userEmail = user?.email ?? ''
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#e2e8f0] bg-white px-4 shrink-0">
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar trigger */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden text-gray-500" />
            }
          >
            <Menu size={20} />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <ManagerSidebarMobile />
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right: notifications, quick-add, user */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative text-gray-500">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Quick-add dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 bg-[#2D3561] hover:bg-[#3a4275] text-white"
              />
            }
          >
            <Plus size={14} />
            Quick Add
            <ChevronDown size={13} className="opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {QUICK_ADD_ITEMS.map((item) => (
              <DropdownMenuItem
                key={item.href}
                onClick={() => router.push(item.href)}
              >
                <item.icon size={15} className="text-gray-500" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  'hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300'
                )}
              />
            }
          >
            <Avatar size="sm">
              <AvatarImage src={user?.image ?? ''} alt={userName} />
              <AvatarFallback className="bg-[#2D3561] text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
              {userName}
            </span>
            <ChevronDown size={13} className="hidden sm:block text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-gray-900">{userName}</span>
                <span className="text-xs font-normal text-gray-500 truncate">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/manager/profile')}>
              <User size={14} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/manager/settings')}>
              <Settings size={14} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={14} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
