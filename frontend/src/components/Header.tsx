'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Healthcare', active: true },
        { href: '#', label: 'Agriculture', active: false },
        { href: '#', label: 'Urban Development', active: false },
    ];

    return (
        <header className="bg-white border-b border-gov-blue-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/emblem.png"
                            alt="Government Emblem"
                            className="h-12 w-auto"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold text-gov-blue-700 leading-tight">
                                सेवा मंच
                            </h1>
                            <p className="text-xs text-gov-blue-500">Service Platform</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${link.active
                                    ? 'text-gov-blue-700 border-b-2 border-gov-blue-600 pb-1'
                                    : 'text-gray-500 hover:text-gov-blue-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
}
