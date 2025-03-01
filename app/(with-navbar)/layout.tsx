import { Navbar } from '@/app/(with-navbar)/landing/components/NavBar'

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
