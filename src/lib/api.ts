import axios from 'axios';
import { DemoRequest } from '../context/AppDataContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/profile'),
    register: (data: any) => api.post('/auth/register', data), // Admin only
};

export const masterData = {
    getAll: () => api.get('/master-data'),
};

export const requests = {
    create: (data: any) => api.post('/requests', data),
    getAll: () => api.get('/requests'),
    getById: (id: string) => api.get(`/requests/${id}`),
    updateStatus: (id: string, data: any) => api.patch(`/requests/${id}/status`, data),
    getPDF: (id: string) => `${API_URL}/requests/${id}/pdf`, // specific logic might be needed
};

export default api;
