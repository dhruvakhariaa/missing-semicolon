import './globals.css';
import { Inter, DM_Sans } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter'
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['400', '500', '600', '700']
});

export const metadata = {
    title: 'Urban Service Platform',
    description: 'Digital Public Infrastructure for Urban Services',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${dmSans.variable}`}>
            <body className="font-inter">{children}</body>
        </html>
    );
}
