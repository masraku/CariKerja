import { Poppins } from 'next/font/google'
import "@/styles/globals.css"
import { AuthProvider } from '@/contexts/AuthContext'
import MainLayout from '@/components/MainLayout'

import TanStackProvider from '@/providers/TanStackProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kerjasimpel.vercel.app'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Disnaker Kabupaten Cirebon - Portal Lowongan Kerja Resmi',
    template: '%s | Disnaker Kabupaten Cirebon'
  },
  description: 'Portal lowongan kerja resmi Dinas Ketenagakerjaan Kabupaten Cirebon. Temukan lowongan pekerjaan terpercaya dari perusahaan terverifikasi di wilayah Cirebon dan sekitarnya.',
  keywords: [
    'lowongan kerja cirebon',
    'loker cirebon',
    'disnaker cirebon',
    'kerja cirebon',
    'bursa kerja cirebon',
    'job portal cirebon',
    'karir cirebon',
    'pekerjaan cirebon',
    'lowongan kerja jawa barat',
    'disnaker',
    'dinas tenaga kerja'
  ],
  authors: [{ name: 'Disnaker Kabupaten Cirebon' }],
  creator: 'Disnaker Kabupaten Cirebon',
  publisher: 'Disnaker Kabupaten Cirebon',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Disnaker Kabupaten Cirebon',
    title: 'Disnaker Kabupaten Cirebon - Portal Lowongan Kerja Resmi',
    description: 'Portal lowongan kerja resmi Dinas Ketenagakerjaan Kabupaten Cirebon. Temukan lowongan pekerjaan terpercaya.',
    images: [
      {
        url: '/assets/logo-disnakerkabcirebon.png',
        width: 1200,
        height: 630,
        alt: 'Disnaker Cirebon - Portal Lowongan Kerja',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Disnaker Kabupaten Cirebon - Portal Lowongan Kerja Resmi',
    description: 'Portal lowongan kerja resmi Dinas Ketenagakerjaan Kabupaten Cirebon.',
    images: ['/assets/logo-disnakerkabcirebon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#03587f" />
        <meta name="geo.region" content="ID-JB" />
        <meta name="geo.placename" content="Cirebon" />
      </head>
      <body className={`${poppins.variable} ${poppins.className} bg-slate-50 text-slate-900 antialiased selection:bg-primary/10 selection:text-primary`}>
        {/* Skip Link for Keyboard Navigation - WCAG AA */}
        <a href="#main-content" className="skip-link">
          Lewati ke Konten Utama
        </a>
        <TanStackProvider>
          <AuthProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  )
}
