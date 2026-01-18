'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/healthcare', label: 'Healthcare' },
    { href: '/agriculture', label: 'Agriculture' },
    { href: '/urban', label: 'Urban Development' },
];

export default function Header() {
    const pathname = usePathname();

    // Check if current path matches or starts with the link href
    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(href);
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Side: Logo */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                        <Image
                            src="/emblem.jpg"
                            alt="National Emblem of India"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-heading text-xl font-bold text-gray-900 leading-tight">
                            Service Delivery Platform
                        </h1>
                        <span className="text-xs text-gray-500 font-medium">
                            Government of India
                        </span>
                    </div>
                </Link>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`
                                relative text-sm font-semibold py-7 transition-all duration-300
                                ${isActive(link.href)
                                    ? 'text-brand-600'
                                    : 'text-gray-500 hover:text-brand-500'
                                }
                                group
                            `}
                        >
                            {/* Link text */}
                            <span className="relative z-10 transition-transform duration-200 group-hover:scale-105 inline-block">
                                {link.label}
                            </span>

                            {/* Active underline indicator */}
                            <span
                                className={`
                                    absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 
                                    transition-all duration-300 ease-out
                                    ${isActive(link.href)
                                        ? 'scale-x-100 opacity-100'
                                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50'
                                    }
                                `}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors duration-200">
                        Login
                    </button>
                </div>
            </div>
        </header>
    );
}
