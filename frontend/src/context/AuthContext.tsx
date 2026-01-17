'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// User type definition
export interface User {
    id: string
    name: string
    email: string
    phone: string
    aadhar?: string
    pan?: string
}

// Auth context type
interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
    logout: () => void
}

// Registration data type
export interface RegisterData {
    name: string
    email: string
    phone: string
    password: string
    aadhar?: string
    pan?: string
}

// Storage keys
const USERS_KEY = 'jansewa_users'
const CURRENT_USER_KEY = 'jansewa_current_user'

// Demo user (pre-seeded)
const DEMO_USER = {
    id: 'demo-001',
    name: 'Demo User',
    email: 'demo@jansewa.gov.in',
    phone: '+91-9876543210',
    password: 'demo123',
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Initialize auth state from localStorage
    useEffect(() => {
        initializeAuth()
    }, [])

    const initializeAuth = () => {
        try {
            // Seed demo user if not exists
            const existingUsers = localStorage.getItem(USERS_KEY)
            if (!existingUsers) {
                localStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]))
            } else {
                const users = JSON.parse(existingUsers)
                const hasDemoUser = users.some((u: any) => u.email === DEMO_USER.email)
                if (!hasDemoUser) {
                    users.push(DEMO_USER)
                    localStorage.setItem(USERS_KEY, JSON.stringify(users))
                }
            }

            // Check for current user session
            const currentUser = localStorage.getItem(CURRENT_USER_KEY)
            if (currentUser) {
                setUser(JSON.parse(currentUser))
            }
        } catch (error) {
            console.error('Error initializing auth:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const usersJson = localStorage.getItem(USERS_KEY)
            if (!usersJson) {
                return { success: false, error: 'No users found. Please register first.' }
            }

            const users = JSON.parse(usersJson)
            const foundUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

            if (!foundUser) {
                return { success: false, error: 'Invalid email or password.' }
            }

            // Create user object without password
            const userWithoutPassword: User = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                phone: foundUser.phone,
                aadhar: foundUser.aadhar,
                pan: foundUser.pan,
            }

            // Save to state and localStorage
            setUser(userWithoutPassword)
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

            return { success: true }
        } catch (error) {
            return { success: false, error: 'An error occurred during login.' }
        }
    }

    const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            const usersJson = localStorage.getItem(USERS_KEY)
            const users = usersJson ? JSON.parse(usersJson) : []

            // Check if email already exists
            const emailExists = users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase())
            if (emailExists) {
                return { success: false, error: 'An account with this email already exists.' }
            }

            // Create new user
            const newUser = {
                id: `user-${Date.now()}`,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                aadhar: userData.aadhar,
                pan: userData.pan,
            }

            // Save to users list
            users.push(newUser)
            localStorage.setItem(USERS_KEY, JSON.stringify(users))

            // Auto-login after registration
            const userWithoutPassword: User = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                aadhar: newUser.aadhar,
                pan: newUser.pan,
            }

            setUser(userWithoutPassword)
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword))

            return { success: true }
        } catch (error) {
            return { success: false, error: 'An error occurred during registration.' }
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem(CURRENT_USER_KEY)
        router.push('/')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
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
