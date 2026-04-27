import { createContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { loginWithGoogle as loginWithGoogleService, logout as logoutService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setCurrentUser({
            id:    firebaseUser.uid,
            name:  data.name  ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            role:  data.role,
          });
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogleService();
      // onAuthStateChanged fires next and updates currentUser + setLoading(false)
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await logoutService();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};