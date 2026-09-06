import { TenantSidebar } from '@/components/layout/tenant-sidebar'
import { TenantTopbar } from '@/components/layout/tenant-topbar'

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <TenantSidebar />
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[200px]">
        <TenantTopbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
