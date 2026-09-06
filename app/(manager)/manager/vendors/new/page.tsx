import { PageHeader } from '@/components/shared/page-header'
import { VendorForm } from '@/components/vendors/vendor-form'

export default function NewVendorPage() {
  return (
    <div>
      <PageHeader title="Add Vendor" description="Add a new contractor or service provider" />
      <VendorForm />
    </div>
  )
}
