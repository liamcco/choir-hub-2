import { ThemeProvider } from '@wrksz/themes/next'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { AppNavigation } from '@/app/app-navigation'
import { Toaster } from '@/components/ui/sonner'
import { getCurrentAccessActor } from '@/lib/access-actor'
import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'CSK Choir Hub',
  description: 'Chalmers Sångkörs digitala nav',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const actor = await getCurrentAccessActor()

  return (
    <html lang="en" className={cn('h-full', 'antialiased', inter.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AppNavigation actor={actor} />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
