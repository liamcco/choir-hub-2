import { AdminNavigation } from '@/core/navigation/admin-navigation'

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AdminNavigation />
      {children}
    </>
  )
}
