import { createContext, useState, ReactNode, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { checkUserProfile, createUserProfile } from '../services/userService';

interface AuthContextProps {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
      if (user) {
          try {
            const profileExists = await checkUserProfile(user.uid);
            if (profileExists) {
              setIsAuthenticated(true);
              setUserId(user.uid);
            } else {
              setIsAuthenticated(false);
              setUserId(null);
            }
       } catch (error) {
        console.error('Fehler beim Überprüfen des Benutzerprofils:', error);
      }
    } else {
      setIsAuthenticated(false);
      setUserId(null);
    }
    setIsLoading(false);
  });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profileExists = await checkUserProfile(user.uid);

    if (!profileExists) {
      throw new Error('Profil nicht gefunden. Bitte registrieren Sie sich zuerst.')
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const profileExists = await checkUserProfile(user.uid);

    if (!profileExists) {
      await createUserProfile(user.uid, user.email!, user.displayName || 'Google-Benutzer');
    }
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!isAuthenticated, 
      userId, 
      isLoading, 
      login, 
      loginWithGoogle,
      logout,
       }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
