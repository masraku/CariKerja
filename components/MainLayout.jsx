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
  
  const showLayout = !noLayoutPages.includes(pathname)

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