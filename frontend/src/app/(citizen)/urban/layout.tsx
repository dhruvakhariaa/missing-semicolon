import Link from 'next/link';
import Image from 'next/image';

export default function UrbanLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Shared Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative">
                            <Image
                                src="/emblem.jpg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-none">Service Delivery Platform</h1>
                            <p className="text-xs text-gray-500 font-medium">Government of India</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
                        <Link href="#" className="hover:text-brand-600 transition">Healthcare</Link>
                        <Link href="#" className="hover:text-brand-600 transition">Agriculture</Link>
                        <Link href="/urban" className="text-brand-600 font-bold border-b-2 border-brand-600 pb-1">Urban Development</Link>
                        <div className="text-red-500 hover:text-red-600 ml-4 cursor-pointer">Logout</div>
                    </nav>
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}
