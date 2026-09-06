import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>
}) {
  const { vendorId } = await params
  redirect(`/manager/vendors/${vendorId}`)
}
