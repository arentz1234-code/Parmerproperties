'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from 'cn'
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  ClipboardCheck,
  FolderOpen,
  MessageCircle,
  Shield,
  User,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    href: '/tenant/dashboard',    icon: <Home size={18} /> },
  { label: 'Pay Rent',     href: '/tenant/pay-rent',     icon: <CreditCard size={18} /> },
  { label: 'Maintenance',  href: '/tenant/maintenance',  icon: <Wrench size={18} /> },
  { label: 'My Lease',     href: '/tenant/lease',        icon: <FileText size={18} /> },
  { label: 'Inspections',  href: '/tenant/inspections',  icon: <ClipboardCheck size={18} /> },
  { label: 'Documents',    href: '/tenant/documents',    icon: <FolderOpen size={18} /> },
  { label: 'Messages',     href: '/tenant/messages',     icon: <MessageCircle size={18} /> },
  { label: 'Insurance',    href: '/tenant/insurance',    icon: <Shield size={18} /> },
  { label: 'Account',      href: '/tenant/account',      icon: <User size={18} /> },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg mx-2 relative',
        isActive
          ? 'bg-[#2d9d5c]/10 text-[#2d9d5c] border-l-4 border-[#2d9d5c] pl-3'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent pl-3'
      )}
    >
      <span className={cn('shrink-0', isActive ? 'text-[#2d9d5c]' : 'text-gray-400')}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  )
}

export function TenantSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const userName = user?.name ?? 'Tenant'
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Mock unit number — in production this would come from tenant data
  const unitNumber = 'Unit 101'

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[200px] flex-col z-30 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 px-4 py-5 border-b border-gray-100 shrink-0">
        <div className="relative size-10 shrink-0 rounded-xl overflow-hidden bg-[#2d9d5c]/10">
          <Image
            src="/logo.png"
            alt="Parmer Properties"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div className="text-center mt-1">
          <p className="text-gray-900 font-semibold text-sm leading-tight">Parmer Properties</p>
          <p className="text-[#2d9d5c] text-xs font-medium">Tenant Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/tenant/dashboard' && pathname.startsWith(item.href))
          return <NavLink key={item.href} item={item} isActive={isActive} />
        })}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar size="default">
            <AvatarImage src={user?.image ?? ''} alt={userName} />
            <AvatarFallback className="bg-[#2d9d5c] text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 text-xs font-semibold leading-tight truncate">{userName}</p>
            <p className="text-gray-500 text-xs truncate">{unitNumber}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs transition-colors w-full"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
