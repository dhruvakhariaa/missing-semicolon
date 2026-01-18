import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Side: Logo */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                        <Image
                            src="/emblem.png"
                            alt="National Emblem of India"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Jan Sewa Portal</h1>
                        <span className="text-xs text-gray-500 font-medium">Government of India</span>
                    </div>
                </div>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/healthcare" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        Healthcare
                    </Link>
                    <Link href="/agriculture" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        Agriculture
                    </Link>
                    <Link href="/urban" className="text-sm font-bold text-brand-600 border-b-2 border-brand-600 py-7">
                        Urban Development
                    </Link>
                </nav>


            </div>
        </header>
    );
}
