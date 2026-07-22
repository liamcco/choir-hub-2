export default function AdminGroupsLayout({
  children,
  detail,
}: Readonly<{
  children: React.ReactNode
  detail: React.ReactNode
}>) {
  return (
    <>
      {children}
      {detail}
    </>
  )
}
