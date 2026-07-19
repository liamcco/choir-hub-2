import { ThemeProvider } from '@wrksz/themes/next'

import type { Metadata } from 'next'
import './globals.css'

import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
