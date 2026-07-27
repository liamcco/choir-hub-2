'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/core/navigation/site'
import { AdminDialog } from '@/features/organization/management/components/admin-dialog'
import { InvalidDetailLookup } from '@/features/organization/management/components/invalid-detail-lookup'
import { PlacementDetail } from './detail'
import type { getPlacementDetail } from './query'

export function PlacementOverlay({ detail }: { detail: Awaited<ReturnType<typeof getPlacementDetail>> }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onClose = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('detail')
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false })
  }
  return (
    <AdminDialog
      title={detail?.name ?? 'User'}
      description="Placement detail"
      contentLabel="Placement detail content"
      onClose={onClose}
    >
      {detail ? (
        <PlacementDetail detail={detail} />
      ) : (
        <InvalidDetailLookup collectionPath={ROUTES.adminPlacement} resourceName="User" />
      )}
    </AdminDialog>
  )
}
