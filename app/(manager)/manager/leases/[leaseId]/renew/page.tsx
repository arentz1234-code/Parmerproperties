import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ leaseId: string }>
}) {
  const { leaseId } = await params
  redirect(`/manager/leases/${leaseId}`)
}
