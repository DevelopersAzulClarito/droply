/**
 * userService.ts
 * CRUD layer for the `users` Firestore collection.
 *
 * Schema (per user document):
 *   id, name, email, phone, role, createdAt
 *
 * Note: User creation at registration is handled by authService.ts.
 * This service handles reads and admin updates.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserRole } from '../types';

const COLLECTION = 'users';

// ─── Helpers ───────────────────────────────────────────────────────────────

function docToUser(id: string, data: Record<string, unknown>): User {
  return { id, ...data } as User;
}

// ─── READ (one) ────────────────────────────────────────────────────────────

/**
 * Fetches a single user document by UID.
 */
export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return docToUser(snap.id, snap.data() as Record<string, unknown>);
}

// ─── READ (all) ────────────────────────────────────────────────────────────

/**
 * Fetches all users (admin only).
 */
export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, COLLECTION), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToUser(d.id, d.data() as Record<string, unknown>));
}

/**
 * Fetches all users with a specific role.
 * Useful for loading keepers list, etc.
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', role),
    orderBy('name', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToUser(d.id, d.data() as Record<string, unknown>));
}

// ─── REAL-TIME LISTENERS ───────────────────────────────────────────────────

/**
 * Subscribes to real-time updates of the full users collection (admin).
 */
export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      onUpdate(snap.docs.map(d => docToUser(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err),
  );
}

/**
 * Subscribes to a single user document (e.g. current user's profile).
 */
export function subscribeToUser(
  uid: string,
  onUpdate: (user: User | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, uid),
    (snap) => {
      onUpdate(snap.exists() ? docToUser(snap.id, snap.data() as Record<string, unknown>) : null);
    },
    (err) => onError?.(err),
  );
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

/**
 * Updates mutable fields of a user profile.
 * Role changes should only be done by admins (enforced by Firestore rules).
 */
export async function updateUser(
  uid: string,
  payload: Partial<Pick<User, 'name' | 'phone' | 'role'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), payload as Record<string, unknown>);
}

/**
 * Promotes or demotes a user's role (admin only).
 */
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), { role });
}

// ─── DELETE ────────────────────────────────────────────────────────────────

/**
 * Deletes a user document (admin only).
 * Note: This does NOT delete the Firebase Auth account — handle that separately
 * via a Cloud Function if needed.
 */
export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, uid));
}
