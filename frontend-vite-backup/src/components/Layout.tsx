import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gov-white text-gov-black font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link to="/">
                        <img src="/logo.png" alt="Satyamev Jayate" className="h-20 object-contain" />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 font-bold text-lg text-black">
                    <Link to="/" className="hover:text-gov-blue-500 transition-colors border-b-2 border-black">Healthcare</Link>
                    <a href="#" className="hover:text-gov-blue-500 transition-colors border-b-2 border-transparent hover:border-gov-blue-500">Agriculture</a>
                    <a href="#" className="hover:text-gov-blue-500 transition-colors border-b-2 border-transparent hover:border-gov-blue-500">Urban Development</a>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gov-blue-700"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </button>
            </header>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 p-4 absolute top-[88px] w-full z-40 shadow-lg">
                    <nav className="flex flex-col gap-4 font-medium text-lg">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gov-blue-600 font-bold">Healthcare</Link>
                        <a href="#" className="text-gray-600">Agriculture</a>
                        <a href="#" className="text-gray-600">Urban Development</a>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gov-blue-700 text-white py-12 mt-auto">
                <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Service Platform</h3>
                        <p className="text-white/80 text-sm">Empowering citizens with seamless access to government services.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-white/80 text-sm">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/doctors" className="hover:text-white">Find Doctors</Link></li>
                            <li><Link to="/appointments" className="hover:text-white">Appointments</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-white/80 text-sm">
                            <li>Help Center</li>
                            <li>Emergency Contacts</li>
                            <li>Feedback</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Contact</h4>
                        <p className="text-white/80 text-sm">1800-111-222 (Toll Free)</p>
                        <p className="text-white/80 text-sm">support@gov-services.in</p>
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
                    <p>© 2026 Government Service Delivery Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
