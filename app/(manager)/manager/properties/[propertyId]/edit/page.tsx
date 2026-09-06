import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params
  redirect(`/manager/properties/${propertyId}`)
}
