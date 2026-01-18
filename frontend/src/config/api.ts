/**
 * Centralized API Configuration
 * All backend API endpoints route through the API Gateway at port 8000
 */

// Hardcoded to force connection to API Gateway
const API_BASE_URL = 'http://localhost:8000/api';

// Urban Service APIs
export const urbanApi = {
    complaints: `${API_BASE_URL}/urban/complaints`,
    serviceRequests: `${API_BASE_URL}/urban/service-requests`,
    notifications: `${API_BASE_URL}/urban/notifications`,
    feedback: `${API_BASE_URL}/urban/feedback`,
    health: `${API_BASE_URL}/urban/health`,
};

// Healthcare Service APIs
export const healthcareApi = {
    appointments: `${API_BASE_URL}/healthcare/appointments`,
    doctors: `${API_BASE_URL}/healthcare/doctors`,
    patients: `${API_BASE_URL}/healthcare/patients`,
    departments: `${API_BASE_URL}/healthcare/departments`,
    health: `${API_BASE_URL}/healthcare/health`,
};

// Agriculture Service APIs
export const agricultureApi = {
    farmers: `${API_BASE_URL}/agriculture/farmers`,
    schemes: `${API_BASE_URL}/agriculture/schemes`,
    advisories: `${API_BASE_URL}/agriculture/advisories`,
    health: `${API_BASE_URL}/agriculture/health`,
};

// API Gateway Health Check
export const gatewayHealth = `http://localhost:8000/health`;

// Auth API
export const authApi = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    me: `${API_BASE_URL}/auth/me`,
    createAdmin: `${API_BASE_URL}/auth/create-admin`,
};

// Requests API (for Sector Manager approval workflow)
export const requestsApi = {
    create: `${API_BASE_URL}/requests`,
    my: `${API_BASE_URL}/requests/my`,
    pending: `${API_BASE_URL}/requests/pending`,
    approve: (id: string) => `${API_BASE_URL}/requests/${id}/approve`,
    reject: (id: string) => `${API_BASE_URL}/requests/${id}/reject`,
};

// Upload API (presigned URLs)
export const uploadApi = {
    presignedUrl: `${API_BASE_URL}/upload/presigned-url`,
};

export default {
    urban: urbanApi,
    healthcare: healthcareApi,
    agriculture: agricultureApi,
    gateway: gatewayHealth,
    auth: authApi,
    requests: requestsApi,
    upload: uploadApi,
};
