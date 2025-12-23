import { Inter } from 'next/font/google'
import "@/styles/globals.css"
import { AuthProvider } from '@/contexts/AuthContext'
import MainLayout from '@/components/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Disnaker - Portal Karir Masa Depan',
  description: 'Temukan karir impian Anda dengan Disnaker. Hubungkan talenta terbaik dengan perusahaan terkemuka di Indonesia.',
  keywords: 'lowongan kerja, karir, pekerjaan, recruitment, job portal, Indonesia, disnaker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  )
}