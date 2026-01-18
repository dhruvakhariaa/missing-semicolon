/**
 * Auth Service - Frontend API calls for authentication
 */

import { authApi } from '../config/api';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'citizen' | 'sector_manager' | 'government_official' | 'system_admin';
    assignedSector?: 'healthcare' | 'agriculture' | 'urban' | null;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        token: string;
        user: User;
    };
    error?: string;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(authApi.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    async register(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
        const response = await fetch(authApi.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, fullName, phone }),
        });
        return response.json();
    },

    async getCurrentUser(token: string): Promise<{ success: boolean; data?: User; error?: string }> {
        const response = await fetch(authApi.me, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    },

    // Store token in localStorage
    setToken(token: string): void {
        localStorage.setItem('sdp_token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('sdp_token');
    },

    removeToken(): void {
        localStorage.removeItem('sdp_token');
    },

    // Check if user is logged in
    isAuthenticated(): boolean {
        return !!this.getToken();
    },

    // Decode token to get user info (without verification)
    getDecodedToken(): User | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return {
                id: decoded.id,
                email: decoded.email,
                fullName: decoded.fullName || decoded.email,
                role: decoded.role,
                assignedSector: decoded.assignedSector,
            };
        } catch {
            return null;
        }
    },
};

export default authService;
