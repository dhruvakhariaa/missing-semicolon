import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jan Sewa Portal | One Platform. Every Service. For Every Citizen.',
  description: 'National-Scale Digital Public Infrastructure for Seamless Service Delivery. Access healthcare, agriculture, and urban services in one unified platform.',
  keywords: ['government services', 'healthcare', 'agriculture', 'urban development', 'citizen portal', 'India', 'digital india'],
  authors: [{ name: 'Government of India' }],
  openGraph: {
    title: 'Jan Sewa Portal',
    description: 'One Platform. Every Service. For Every Citizen.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-brand-50 font-sans custom-scrollbar">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
