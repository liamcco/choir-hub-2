export default function AdminPositionsLayout({
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
