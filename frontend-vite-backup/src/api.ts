import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/healthcare',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getDepartments = () => api.get('/departments');
export const getDoctors = (params?: any) => api.get('/doctors', { params });
export const getDoctorById = (id: string) => api.get(`/doctors/${id}`);
export const getDoctorAvailability = (id: string, date: string) => api.get(`/doctors/${id}/availability`, { params: { date } });
export const getPatientProfile = () => api.get('/patients/me'); // Requires Auth
export const createAppointment = (data: any) => api.post('/appointments', data);
export const getMyAppointments = () => api.get('/appointments');

export default api;
