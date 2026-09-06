import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ ownerId: string }>
}) {
  const { ownerId } = await params
  redirect(`/manager/owners/${ownerId}`)
}
