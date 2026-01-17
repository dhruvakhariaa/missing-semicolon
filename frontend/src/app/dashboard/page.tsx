'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import { Wheat, Stethoscope, Building2, ArrowLeft, LogOut } from 'lucide-react'

function DashboardContent() {
    const { user, logout } = useAuth()

    return (
        <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-brand-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="font-heading text-xl font-bold text-brand-700">
                        Jan Sewa Portal
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-brand-600">Welcome, <strong>{user?.name}</strong></span>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-800 mb-4">Service Dashboard</h1>
                    <p className="text-lg text-brand-600">Select a service to get started</p>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {/* Agriculture - Active */}
                    <Link
                        href="/agriculture"
                        className="group p-8 bg-white rounded-2xl border-2 border-emerald-400 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Wheat className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-emerald-600 mb-2">Agriculture</h2>
                        <p className="text-gray-600 mb-4">Farmer support, advisories, and market access.</p>
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 text-sm font-medium rounded-full">
                            Available
                        </span>
                    </Link>

                    {/* Healthcare - Coming Soon */}
                    <Link
                        href="/healthcare"
                        className="group p-8 bg-white rounded-2xl border-2 border-rose-400 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Stethoscope className="w-8 h-8 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-rose-600 mb-2">Healthcare</h2>
                        <p className="text-gray-600 mb-4">Book appointments and access medical services.</p>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-600 text-sm font-medium rounded-full">
                            Coming Soon
                        </span>
                    </Link>

                    {/* Urban - Coming Soon */}
                    <Link
                        href="/urban"
                        className="group p-8 bg-white rounded-2xl border-2 border-blue-400 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-2">Urban</h2>
                        <p className="text-gray-600 mb-4">Civic services and municipal facilities.</p>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-600 text-sm font-medium rounded-full">
                            Coming Soon
                        </span>
                    </Link>
                </div>

                {/* Back to Home */}
                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-700">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default function Dashboard() {
    return (
        <AuthGuard>
            <DashboardContent />
        </AuthGuard>
    )
}
