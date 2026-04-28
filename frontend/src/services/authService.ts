import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { User } from '../types';

export async function loginWithGoogle(): Promise<User> {
  const { user: fbUser } = await signInWithPopup(auth, googleProvider);

  const userRef = doc(db, 'users', fbUser.uid);
  const snap    = await getDoc(userRef);

  if (!snap.exists()) {
    const payload = {
      id:        fbUser.uid,
      name:      fbUser.displayName ?? '',
      email:     fbUser.email       ?? '',
      phone:     '',
      role:      'customer' as const,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, payload);

    // Return a plain User without the server timestamp (not readable until next fetch)
    const { createdAt: _, ...appUser } = payload;
    return appUser;
  }

  const data = snap.data();
  return {
    id:    fbUser.uid,
    name:  data.name  ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    role:  data.role,
  };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}