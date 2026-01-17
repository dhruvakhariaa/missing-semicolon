'use client'

import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import { Building2, ArrowLeft, Clock } from 'lucide-react'

function UrbanContent() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-brand-100 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Building2 className="w-12 h-12 text-blue-600" />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-brand-800 mb-4">Urban Services</h1>

                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full mb-6">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Coming Soon</span>
                </div>

                {/* Description */}
                <p className="text-lg text-brand-600 mb-8">
                    We're building a comprehensive urban services platform for civic issue reporting,
                    complaint tracking, and municipal service requests.
                </p>

                {/* Back to Dashboard */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 btn-primary"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </div>
        </main>
    )
}

export default function UrbanPage() {
    return (
        <AuthGuard>
            <UrbanContent />
        </AuthGuard>
    )
}
