import Link from 'next/link';
import { User, LogOut } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Side: Logo */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-400">
                        Logo
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">Service Delivery Platform</h1>
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

                {/* Right Side: Logout */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
