import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'

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
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-gov-blue-700 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold mb-4">Jan Sewa Portal</h3>
                  <p className="text-sm text-gov-blue-200">
                    Empowering citizens with seamless access to government services.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <ul className="space-y-2 text-sm text-gov-blue-200">
                    <li><a href="/" className="hover:text-white">Home</a></li>
                    <li><a href="/doctors" className="hover:text-white">Find Doctors</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Support</h4>
                  <ul className="space-y-2 text-sm text-gov-blue-200">
                    <li>Help Center</li>
                    <li>Emergency Contacts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <p className="text-sm text-gov-blue-200">1800-111-222 (Toll Free)</p>
                  <p className="text-sm text-gov-blue-200">support@jansewa.gov.in</p>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
