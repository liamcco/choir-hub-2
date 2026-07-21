export default function AdminMembersLayout({
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
