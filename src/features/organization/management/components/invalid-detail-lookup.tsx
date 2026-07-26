'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from '@/shared/ui/toast'

export function InvalidDetailLookup({
  collectionPath,
  resourceName,
}: {
  collectionPath: string
  resourceName: string
}) {
  const router = useRouter()

  useEffect(() => {
    toast.add({ title: `${resourceName} not found.`, type: 'error' })
    router.replace(collectionPath, { scroll: false })
  }, [collectionPath, resourceName, router])

  return null
}
