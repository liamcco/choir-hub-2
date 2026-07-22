export default function AdminLayout({
  children,
  detail,
}: Readonly<{ children: React.ReactNode; detail: React.ReactNode }>) {
  return (
    <>
      {children}
      {detail}
    </>
  )
}
