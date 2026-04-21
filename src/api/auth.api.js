import api from './axios.config';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.patch('/auth/profile', data);
export const changePassword = (data) => api.patch('/auth/change-password', data);
export const changeEmail = (data) => api.patch('/auth/change-email', data);
export const changeAdminId = (data) => api.patch('/auth/change-adminid', data);
