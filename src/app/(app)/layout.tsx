import { Suspense } from 'react'

import { AppNavigation, RuntimeAppNavigation } from '@/app/app-navigation'

export default function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Suspense fallback={<AppNavigation actor={null} />}>
        <RuntimeAppNavigation />
      </Suspense>
      {children}
    </>
  )
}
