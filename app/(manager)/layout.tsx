import { ManagerSidebar } from '@/components/layout/manager-sidebar'
import { ManagerTopbar } from '@/components/layout/manager-topbar'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ManagerSidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-60">
        <ManagerTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
