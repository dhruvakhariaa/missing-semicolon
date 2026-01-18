'use client';

import Link from 'next/link';

const footerLinks = {
    quickLinks: [
        { name: 'Home', href: '/' },
        { name: 'File Complaint', href: '/urban' },
        { name: 'Track Status', href: '/urban' },
    ],
    support: [
        { name: 'Help Center', href: '#' },
        { name: 'Emergency Contacts', href: '#' },
        { name: 'Feedback', href: '#' },
    ],
};

export default function DashboardFooter() {
    return (
        <footer className="bg-brand-700 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Service Platform Info */}
                    <div>
                        <h4 className="text-white font-heading font-semibold mb-4">
                            Service Platform
                        </h4>
                        <p className="text-brand-200 font-body text-sm leading-relaxed">
                            Empowering citizens with seamless access to government services.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-heading font-semibold mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-brand-200 font-body text-sm">
                            {footerLinks.quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-white transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-heading font-semibold mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2 text-brand-200 font-body text-sm">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-white transition-colors duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-heading font-semibold mb-4">
                            Contact
                        </h4>
                        <ul className="space-y-2 text-brand-200 font-body text-sm">
                            <li>1800-111-222 (Toll Free)</li>
                            <li>support@gov-services.in</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-brand-600 mt-8 pt-8 text-center text-brand-300 font-body text-sm">
                    © {new Date().getFullYear()} Government Service Delivery Platform. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
