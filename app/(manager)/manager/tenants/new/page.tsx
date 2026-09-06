import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { TenantForm } from '@/components/tenants/tenant-form'

export default function NewTenantPage() {
  return (
    <div>
      <PageHeader title="Add Tenant" description="Create a new tenant record.">
        <Link href="/manager/tenants" className={buttonVariants({ variant: 'outline' })}>
          <ArrowLeft size={14} />
          Back to Tenants
        </Link>
      </PageHeader>

      <TenantForm mode="create" />
    </div>
  )
}
