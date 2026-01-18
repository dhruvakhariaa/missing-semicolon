import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', weight: ['400', '500', '700'] })

export const metadata: Metadata = {
    title: 'Jan Sewa Portal',
    description: 'National-Scale Digital Public Infrastructure',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${dmSans.variable} font-sans`}>{children}</body>
        </html>
    )
}
