import { ThemeProvider } from '@wrksz/themes/next'

import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AppNavigation, RuntimeAppNavigation } from '@/app/app-navigation'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

import './globals.css'

export const metadata: Metadata = {
  title: 'CSK Choir Hub',
  description: 'Chalmers Sångkörs digitala nav',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn('h-full', 'antialiased')} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Suspense fallback={<AppNavigation actor={null} />}>
            <RuntimeAppNavigation />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
