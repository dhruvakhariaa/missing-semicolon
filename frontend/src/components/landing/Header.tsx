'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Globe, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'gu', name: 'ગુજરાતી' },
]

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#stats' },
    { name: 'Testimonials', href: '#testimonials' },
]

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.user-dropdown') && !target.closest('.lang-dropdown')) {
                setIsUserDropdownOpen(false)
                setIsLangDropdownOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="section-container">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="#home" className="flex items-center gap-3 group">
                        <Image src="/images/logo.jpeg" alt="Jan Sewa Portal Logo" width={48} height={48} className="rounded-lg transition-transform duration-300 group-hover:scale-105" />
                        <div className="hidden sm:block">
                            <h1 className="font-heading font-bold text-lg text-brand-700 leading-tight">
                                Jan Sewa Portal
                            </h1>
                            <p className="text-xs text-brand-500 font-medium">
                                Government of India
                            </p>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="relative font-medium text-brand-600 hover:text-brand-800 transition-colors duration-200 py-2
                         after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-500
                         after:transition-all after:duration-300 hover:after:w-full"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Language Selector */}
                        <div className="relative lang-dropdown">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsLangDropdownOpen(!isLangDropdownOpen)
                                    setIsUserDropdownOpen(false)
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-600 
                         hover:bg-brand-100 transition-colors duration-200"
                                aria-label="Select Language"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="hidden sm:inline text-sm font-medium">
                                    {languages.find((l) => l.code === selectedLanguage)?.name}
                                </span>
                            </button>

                            {isLangDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-brand-100 py-2 min-w-[140px] animate-fade-in">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setSelectedLanguage(lang.code)
                                                setIsLangDropdownOpen(false)
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200
                                ${selectedLanguage === lang.code
                                                    ? 'bg-brand-100 text-brand-700 font-medium'
                                                    : 'text-brand-600 hover:bg-brand-50'
                                                }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            /* User Dropdown */
                            <div className="relative user-dropdown hidden sm:block">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setIsUserDropdownOpen(!isUserDropdownOpen)
                                        setIsLangDropdownOpen(false)
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium max-w-[100px] truncate">{user?.name?.split(' ')[0]}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isUserDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-brand-100 py-2 min-w-[200px] animate-fade-in">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-brand-100">
                                            <p className="font-medium text-brand-800">{user?.name}</p>
                                            <p className="text-sm text-brand-500 truncate">{user?.email}</p>
                                        </div>

                                        {/* Menu Items */}
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-brand-600 hover:bg-brand-50 transition-colors"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setIsUserDropdownOpen(false)
                                                logout()
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Login Button */
                            <Link
                                href="/login"
                                className="btn-primary text-sm hidden sm:inline-flex"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-brand-600 hover:bg-brand-100 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-brand-100 animate-fade-in-down">
                        <div className="flex flex-col gap-2 pt-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 rounded-lg text-brand-600 font-medium hover:bg-brand-100 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-lg text-brand-600 font-medium hover:bg-brand-100 transition-colors flex items-center gap-2"
                                    >
                                        <LayoutDashboard className="w-5 h-5" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false)
                                            logout()
                                        }}
                                        className="mx-4 mt-2 btn-secondary text-center flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-primary mx-4 mt-2 text-center"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
