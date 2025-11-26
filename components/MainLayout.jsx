'use client'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function MainLayout({ children }) {
  const pathname = usePathname()
  
  // Halaman yang tidak perlu Header & Footer
  const noLayoutPages = [
    '/login',
    '/register',
    '/register/jobseeker',
    '/register/recruiter',
    '/forgot-password',
    '/unauthorized'
  ]
  
  // Admin routes should not have MainLayout (they have their own sidebar layout)
  const isAdminRoute = pathname?.startsWith('/admin')
  const showLayout = !noLayoutPages.includes(pathname) && !isAdminRoute

  if (!showLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}