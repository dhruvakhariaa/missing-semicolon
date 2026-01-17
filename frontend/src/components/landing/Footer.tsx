'use client'

import { Mail, Phone, MapPin, ExternalLink, ArrowUp } from 'lucide-react'
import Image from 'next/image'

const footerLinks = {
    services: [
        { name: 'Healthcare Services', href: '/healthcare' },
        { name: 'Agriculture Services', href: '/agriculture' },
        { name: 'Urban Development', href: '/urban' },
        { name: 'All Services', href: '/services' },
    ],
    resources: [
        { name: 'Help Center', href: '/help' },
        { name: 'FAQs', href: '/faqs' },
        { name: 'User Guides', href: '/guides' },
        { name: 'API Documentation', href: '/api-docs' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Accessibility', href: '/accessibility' },
        { name: 'RTI', href: '/rti' },
    ],
    government: [
        { name: 'India.gov.in', href: 'https://india.gov.in', external: true },
        { name: 'Digital India', href: 'https://digitalindia.gov.in', external: true },
        { name: 'MyGov', href: 'https://mygov.in', external: true },
        { name: 'Data.gov.in', href: 'https://data.gov.in', external: true },
    ],
}

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="bg-brand-800 text-white">
            {/* Main Footer */}
            <div className="section-container py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            {/* Logo */}
                            <Image src="/images/logo.jpeg" alt="Jan Sewa Portal Logo" width={56} height={56} className="rounded-lg" />
                            <div>
                                <h3 className="font-heading font-bold text-xl">Jan Sewa Portal</h3>
                                <p className="text-brand-300 text-sm">Government of India</p>
                            </div>
                        </div>
                        <p className="text-brand-300 mb-6 leading-relaxed">
                            A unified digital platform for seamless access to healthcare, agriculture, and urban development services across India.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="tel:1800-111-555" className="flex items-center gap-3 text-brand-300 hover:text-white transition-colors">
                                <Phone className="w-5 h-5" />
                                <span>1800-111-555 (Toll Free)</span>
                            </a>
                            <a href="mailto:support@jansewa.gov.in" className="flex items-center gap-3 text-brand-300 hover:text-white transition-colors">
                                <Mail className="w-5 h-5" />
                                <span>support@jansewa.gov.in</span>
                            </a>
                            <div className="flex items-start gap-3 text-brand-300">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                                <span>Ministry of Electronics & IT<br />New Delhi, India - 110001</span>
                            </div>
                        </div>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-4">Services</h4>
                        <ul className="space-y-3">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-brand-300 hover:text-white transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-brand-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-brand-300 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Government Links */}
                    <div>
                        <h4 className="font-heading font-semibold text-lg mb-4">Government</h4>
                        <ul className="space-y-3">
                            {footerLinks.government.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-300 hover:text-white transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.name}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-brand-700">
                <div className="section-container py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-brand-400 text-sm text-center sm:text-left">
                            © {new Date().getFullYear()} Jan Sewa Portal. Government of India. All rights reserved.
                        </p>

                        <div className="flex items-center gap-4">
                            {/* Language indicator */}
                            <span className="text-brand-400 text-sm">
                                Available in: English • हिंदी • ગુજરાતી
                            </span>

                            {/* Scroll to top */}
                            <button
                                onClick={scrollToTop}
                                className="p-2 rounded-full bg-brand-700 text-brand-300 hover:bg-brand-600 hover:text-white transition-colors"
                                aria-label="Scroll to top"
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer >
    )
}
