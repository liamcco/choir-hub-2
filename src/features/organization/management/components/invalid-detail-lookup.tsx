'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function InvalidDetailLookup({
  collectionPath,
  resourceName,
}: {
  collectionPath: string
  resourceName: string
}) {
  const router = useRouter()

  useEffect(() => {
    toast.error(`${resourceName} not found.`)
    router.replace(collectionPath, { scroll: false })
  }, [collectionPath, resourceName, router])

  return null
}
