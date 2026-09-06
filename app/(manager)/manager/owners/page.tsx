import Link from 'next/link'
import { Plus, Eye, Pencil, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { getOwners } from '@/lib/actions/owner-actions'
import { cn } from 'cn'

export default async function OwnersPage() {
  const result = await getOwners()
  const owners = result.success ? result.data : []

  return (
    <div>
      <PageHeader title="Owners" description="Property owner directory and financial overview">
        <Link href="/manager/owners/new" className={buttonVariants({})}>
          <Plus size={14} />
          Add Owner
        </Link>
      </PageHeader>

      {owners.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Users size={28} />}
              title="No owners yet"
              description="Add property owners to manage ownership shares and generate statements."
              action={
                <Link href="/manager/owners/new" className={buttonVariants({})}>
                  <Plus size={14} />
                  Add Owner
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Properties Owned</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {owners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-gray-900">
                          {owner.firstName} {owner.lastName}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{owner.email}</td>
                      <td className="py-3 pr-4 text-gray-600">{owner.phone ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {owner.properties.length} propert{owner.properties.length === 1 ? 'y' : 'ies'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/manager/owners/${owner.id}`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="View"
                          >
                            <Eye size={13} />
                          </Link>
                          <Link
                            href={`/manager/owners/${owner.id}/edit`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
