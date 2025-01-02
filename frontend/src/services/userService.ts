import api from './api';

export const registerUser = (email: string, password: string, role: string) =>
  api.post('/users/register', { email, password, role });

export const loginUser = (email: string, password: string) =>
  api.post('/users/login', { email, password });
