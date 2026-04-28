import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "mock-measurement-id",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Mantenemos tu configuración para la base de datos (por si luego usas múltiples DBs)
export const db = getFirestore(
  app,
  import.meta.env.VITE_FIREBASE_DATABASE_ID ?? '(default)'
);

export const googleProvider = new GoogleAuthProvider();

export default app;