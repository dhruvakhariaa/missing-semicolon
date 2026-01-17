import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/healthcare',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getDepartments = () => api.get('/departments');
export const getDoctors = (params?: any) => api.get('/doctors', { params });
export const getDoctorById = (id: string) => api.get(`/doctors/${id}`);
export const getDoctorAvailability = (id: string, date: string) => api.get(`/doctors/${id}/availability`, { params: { date } });
export const getPatientProfile = () => api.get('/patients/me');
export const createAppointment = (data: any) => api.post('/appointments', data);
export const getMyAppointments = () => api.get('/appointments');

export default api;
