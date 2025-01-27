import { doc, getDoc, setDoc } from 'firebase/firestore';
import api from './api';
import { db } from '../firebaseConfig';

// Benutzer registrieren
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    return await api.post('/users/register', { email, password, name });
  } catch (error: unknown) {
    // Fehler typisieren
    if (error instanceof Error) {
      const axiosError = error as any; // Falls du axios verwendest
      console.error('Error during registration:', axiosError.response?.data || axiosError.message);
      throw new Error(axiosError.response?.data?.error || 'Failed to register user.');
    } else {
      console.error('Unknown error:', error);
      throw new Error('An unknown error occurred.');
    }
  }
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

// Prüft, ob ein Benutzerprofil existiert
export const checkUserProfile = async (uid: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  } catch (err) {
    console.error('Fehler beim Überprüfen des Benutzerprofils:', err);
    return false;
  }
};

// Erstellt ein neues Benutzerprofil
export const createUserProfile = async (uid: string, email: string, name: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      email,
      name,
      role: 'user',
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Fehler beim Erstellen des Benutzerprofils:', err);
    throw err;
  }
};


