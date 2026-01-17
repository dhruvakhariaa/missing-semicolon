'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface AuthGuardProps {
    children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, router])

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
