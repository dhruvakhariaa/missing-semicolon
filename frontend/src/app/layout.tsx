import type { Metadata } from 'next'
import './globals.css'

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
        <html lang="en" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen bg-brand-50 custom-scrollbar">
                {children}
            </body>
        </html>
    )
}
