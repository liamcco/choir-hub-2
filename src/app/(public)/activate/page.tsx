import { ActivationForm } from '@/features/account/activation'

export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const token = (await searchParams).token
  return <ActivationForm token={typeof token === 'string' ? token : undefined} />
}
