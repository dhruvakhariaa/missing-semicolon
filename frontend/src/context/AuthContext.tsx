'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../config/api'

// User type definition with 4-role system
export interface User {
    id: string
    fullName: string
    email: string
    phone?: string
    role: 'citizen' | 'sector_manager' | 'government_official' | 'system_admin'
    assignedSector?: 'healthcare' | 'agriculture' | 'urban' | null
}

// Auth context type
interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    hasRole: (roles: string[]) => boolean
    canAccessSector: (sector: string) => boolean
}

// Registration data type
export interface RegisterData {
    fullName: string
    email: string
    phone?: string
    password: string
}

// Storage key
const TOKEN_KEY = 'sdp_token'

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize auth state from localStorage
    useEffect(() => {
        initializeAuth()
    }, [])

    const initializeAuth = async () => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY)
            if (storedToken) {
                // Verify token by fetching current user
                const response = await fetch(authApi.me, {
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setUser(data.data)
                        setToken(storedToken)
                    } else {
                        localStorage.removeItem(TOKEN_KEY)
                    }
                } else {
                    localStorage.removeItem(TOKEN_KEY)
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error)
            localStorage.removeItem(TOKEN_KEY)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(authApi.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (data.success && data.data) {
                setUser(data.data.user)
                setToken(data.data.token)
                localStorage.setItem(TOKEN_KEY, data.data.token)
                return { success: true }
            }

            return { success: false, error: data.error || 'Login failed' }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' }
        }
    }

    const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(authApi.register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })

            const data = await response.json()

            if (data.success && data.data) {
                setUser(data.data.user)
                setToken(data.data.token)
                localStorage.setItem(TOKEN_KEY, data.data.token)
                return { success: true }
            }

            return { success: false, error: data.error || 'Registration failed' }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' }
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem(TOKEN_KEY)
        router.push('/')
    }

    // Check if user has one of the specified roles
    const hasRole = (roles: string[]): boolean => {
        if (!user) return false
        return roles.includes(user.role)
    }

    // Check if user can access a specific sector
    const canAccessSector = (sector: string): boolean => {
        if (!user) return false
        if (user.role === 'government_official') return true
        if (user.role === 'sector_manager' && user.assignedSector === sector) return true
        return false
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                hasRole,
                canAccessSector,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
