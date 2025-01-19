import api from './api';

// Benutzer registrieren
export const registerUser = async (email: string, password: string, name: string, birthday: string) => {
  return api.post('/users/register', { email, password, name, birthday });
};

// Benutzerprofil abrufen
export const getProfile = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Admin-Status prüfen
export const checkIfAdmin = async (userId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/admin/isAdmin/${userId}`);
    return response.data.isAdmin;
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};
