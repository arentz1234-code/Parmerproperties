import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { PropertyForm } from '@/components/properties/property-form'

export default function NewPropertyPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Add Property" description="Add a new property to your portfolio">
        <Link href="/manager/properties" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft size={14} />
          Back
        </Link>
      </PageHeader>
      <PropertyForm />
    </div>
  )
}
