'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from 'cn'
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  UserCheck,
  Wrench,
  DollarSign,
  FileText,
  BarChart3,
  AlertTriangle,
  ClipboardCheck,
  FolderOpen,
  CheckSquare,
  ClipboardList,
  UserPlus,
  MapPin,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Settings,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const NAV_GROUPS = [
  {
    group: 'OVERVIEW',
    items: [{ label: 'Dashboard', href: '/manager/dashboard', icon: <LayoutDashboard size={16} /> }],
  },
  {
    group: 'PROPERTIES',
    items: [
      { label: 'Properties', href: '/manager/properties', icon: <Building2 size={16} /> },
      { label: 'Units', href: '/manager/units', icon: <Home size={16} /> },
    ],
  },
  {
    group: 'PEOPLE',
    items: [
      { label: 'Tenants', href: '/manager/tenants', icon: <Users size={16} /> },
      { label: 'Owners', href: '/manager/owners', icon: <UserCheck size={16} /> },
      { label: 'Vendors', href: '/manager/vendors', icon: <Wrench size={16} /> },
    ],
  },
  {
    group: 'FINANCIALS',
    items: [
      { label: 'Payments', href: '/manager/payments', icon: <DollarSign size={16} /> },
      { label: 'Leases', href: '/manager/leases', icon: <FileText size={16} /> },
      { label: 'Accounting', href: '/manager/accounting', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { label: 'Maintenance', href: '/manager/maintenance', icon: <AlertTriangle size={16} /> },
      { label: 'Inspections', href: '/manager/inspections', icon: <ClipboardCheck size={16} /> },
      { label: 'Documents', href: '/manager/documents', icon: <FolderOpen size={16} /> },
      { label: 'Tasks', href: '/manager/tasks', icon: <CheckSquare size={16} /> },
    ],
  },
  {
    group: 'LEASING',
    items: [
      { label: 'Applications', href: '/manager/applications', icon: <ClipboardList size={16} /> },
      { label: 'Leads', href: '/manager/leads', icon: <UserPlus size={16} /> },
      { label: 'Listings', href: '/manager/listings', icon: <MapPin size={16} /> },
    ],
  },
  {
    group: 'COMMUNICATIONS',
    items: [
      { label: 'Messages', href: '/manager/communications', icon: <MessageSquare size={16} /> },
      { label: 'Delinquency', href: '/manager/delinquency', icon: <AlertCircle size={16} /> },
    ],
  },
  {
    group: 'REPORTS',
    items: [{ label: 'Reports', href: '/manager/reports', icon: <TrendingUp size={16} /> }],
  },
  {
    group: 'SETTINGS',
    items: [{ label: 'Settings', href: '/manager/settings', icon: <Settings size={16} /> }],
  },
]

export function ManagerSidebarMobile() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const userName = user?.name ?? 'Manager'
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#2D3561' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div className="relative size-8 shrink-0 rounded-lg overflow-hidden bg-white/10">
          <Image src="/logo.png" alt="Parmer Properties" fill className="object-contain p-0.5" />
        </div>
        <span className="text-white font-semibold text-sm">Parmer Properties</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="mb-1">
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
              {group.group}
            </p>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/manager/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm transition-colors border-l-4',
                    isActive
                      ? 'text-white bg-white/10 border-[#2d9d5c] pl-3'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border-transparent pl-3'
                  )}
                >
                  <span className={cn('shrink-0', isActive ? 'text-white' : 'text-white/60')}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="flex items-center gap-3 mb-2">
          <Avatar size="default">
            <AvatarImage src={user?.image ?? ''} alt={userName} />
            <AvatarFallback className="bg-[#2d9d5c] text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-white/50 text-xs truncate">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  )
}
