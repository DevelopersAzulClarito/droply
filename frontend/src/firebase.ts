import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db   = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID ?? '(default)');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST   = 'list',
  GET    = 'get',
  WRITE  = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId:        auth.currentUser?.uid,
      email:         auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous:   auth.currentUser?.isAnonymous,
      tenantId:      auth.currentUser?.tenantId,
      providerInfo:  auth.currentUser?.providerData.map(p => ({
        providerId:  p.providerId,
        displayName: p.displayName,
        email:       p.email,
        photoUrl:    p.photoURL,
      })) ?? [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Firebase: client is offline. Check your configuration.');
    }
  }
}
testConnection();

export default app;
