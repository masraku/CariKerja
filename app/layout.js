import { Inter } from 'next/font/google'
import "@/styles/globals.css"
import { AuthProvider } from '@/contexts/AuthContext'
import MainLayout from '@/components/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'JobSeeker - Platform Pencarian Kerja Terpercaya',
  description: 'Temukan karir impian Anda dengan JobSeeker. Hubungkan talenta terbaik dengan perusahaan terkemuka di Indonesia.',
  keywords: 'lowongan kerja, karir, pekerjaan, recruitment, job portal, Indonesia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}