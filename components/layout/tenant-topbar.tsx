'use client'

import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Home,
  CreditCard,
  Wrench,
  FileText,
  ClipboardCheck,
  FolderOpen,
  MessageCircle,
  Shield,
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
import Link from 'next/link'
import Image from 'next/image'

const PAGE_TITLES: Record<string, string> = {
  dashboard:   'Dashboard',
  'pay-rent':  'Pay Rent',
  maintenance: 'Maintenance',
  lease:       'My Lease',
  inspections: 'Inspections',
  documents:   'Documents',
  messages:    'Messages',
  insurance:   'Insurance',
  account:     'Account',
}

const MOBILE_NAV = [
  { label: 'Dashboard',   href: '/tenant/dashboard',   icon: Home },
  { label: 'Pay Rent',    href: '/tenant/pay-rent',    icon: CreditCard },
  { label: 'Maintenance', href: '/tenant/maintenance', icon: Wrench },
  { label: 'My Lease',    href: '/tenant/lease',       icon: FileText },
  { label: 'Inspections', href: '/tenant/inspections', icon: ClipboardCheck },
  { label: 'Documents',   href: '/tenant/documents',   icon: FolderOpen },
  { label: 'Messages',    href: '/tenant/messages',    icon: MessageCircle },
  { label: 'Insurance',   href: '/tenant/insurance',   icon: Shield },
  { label: 'Account',     href: '/tenant/account',     icon: User },
]

function usePageTitle(): string {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  for (let i = segments.length - 1; i >= 0; i--) {
    const title = PAGE_TITLES[segments[i]]
    if (title) return title
  }
  return 'Tenant Portal'
}

export function TenantTopbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const pageTitle = usePageTitle()

  const user = session?.user
  const userName = user?.name ?? 'Tenant'
  const userEmail = user?.email ?? ''
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
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
          <SheetContent side="left" className="p-0 w-[200px]" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {/* Mobile sidebar content */}
            <div className="flex flex-col h-full bg-white">
              <div className="flex flex-col items-center gap-1 px-4 py-5 border-b border-gray-100">
                <div className="relative size-9 rounded-xl overflow-hidden bg-[#2d9d5c]/10">
                  <Image src="/logo.png" alt="Parmer Properties" fill className="object-contain p-1" />
                </div>
                <p className="text-gray-900 font-semibold text-sm leading-tight mt-1">Parmer Properties</p>
                <p className="text-[#2d9d5c] text-xs font-medium">Tenant Portal</p>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
                {MOBILE_NAV.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/tenant/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg mx-2 border-l-4',
                        isActive
                          ? 'bg-[#2d9d5c]/10 text-[#2d9d5c] border-[#2d9d5c] pl-3'
                          : 'text-gray-600 hover:bg-gray-100 border-transparent pl-3'
                      )}
                    >
                      <item.icon size={18} className={isActive ? 'text-[#2d9d5c]' : 'text-gray-400'} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Right: notifications + user dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" className="relative text-gray-500">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 flex size-3.5 items-center justify-center rounded-full bg-[#2d9d5c] text-[8px] font-bold text-white leading-none">
            2
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

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
              <AvatarFallback className="bg-[#2d9d5c] text-white text-xs">
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
            <DropdownMenuItem onClick={() => router.push('/tenant/account')}>
              <User size={14} />
              Profile
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
