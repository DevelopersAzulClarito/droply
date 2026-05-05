/**
 * bookingService.ts
 * Full CRUD layer for the `bookings` Firestore collection.
 *
 * Schema (per booking document):
 *   id, bookingCode, name, phone, email,
 *   pickup, dropoff, date, time, bags,
 *   price, status, assignedKeeper?, createdAt
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Booking, NewBookingPayload, UpdateBookingPayload } from '../types';

const COLLECTION = 'bookings';

// ─── Helpers ───────────────────────────────────────────────────────────────

function docToBooking(id: string, data: Record<string, unknown>): Booking {
  return { id, ...data } as Booking;
}

// ─── Booking Code Generator ────────────────────────────────────────────────

/**
 * Generates a short unique booking code like "DRP-A3X9".
 */
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DRP-${code}`;
}

// ─── CREATE ────────────────────────────────────────────────────────────────

/**
 * Creates a new booking document in Firestore.
 * Returns the newly created booking (including the generated id and createdAt).
 */
export async function createBooking(payload: NewBookingPayload): Promise<Booking> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  });

  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Booking was not created.');
  return docToBooking(snap.id, snap.data() as Record<string, unknown>);
}

// ─── READ (one) ────────────────────────────────────────────────────────────

/**
 * Fetches a single booking by its Firestore document ID.
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, COLLECTION, bookingId));
  if (!snap.exists()) return null;
  return docToBooking(snap.id, snap.data() as Record<string, unknown>);
}

// ─── READ (all) ────────────────────────────────────────────────────────────

/**
 * Fetches all bookings, ordered by createdAt descending.
 */
export async function getAllBookings(): Promise<Booking[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToBooking(d.id, d.data() as Record<string, unknown>));
}

/**
 * Fetches all bookings assigned to a specific keeper.
 */
export async function getBookingsByKeeper(keeperUid: string): Promise<Booking[]> {
  const q = query(
    collection(db, COLLECTION),
    where('assignedKeeper', '==', keeperUid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToBooking(d.id, d.data() as Record<string, unknown>));
}

/**
 * Fetches all bookings for a specific customer email.
 */
export async function getBookingsByEmail(email: string): Promise<Booking[]> {
  const q = query(
    collection(db, COLLECTION),
    where('email', '==', email),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToBooking(d.id, d.data() as Record<string, unknown>));
}

// ─── REAL-TIME LISTENER ────────────────────────────────────────────────────

/**
 * Subscribes to real-time updates on the bookings collection.
 * Optionally filter by additional constraints.
 *
 * @example
 * const unsub = subscribeToBookings((bookings) => setBookings(bookings));
 * // on cleanup: unsub();
 */
export function subscribeToBookings(
  onUpdate: (bookings: Booking[]) => void,
  onError?: (err: Error) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    orderBy('createdAt', 'desc'),
    ...constraints,
  );

  return onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs.map(d =>
        docToBooking(d.id, d.data() as Record<string, unknown>),
      );
      onUpdate(bookings);
    },
    (err) => onError?.(err),
  );
}

/**
 * Subscribes to real-time updates for a single booking.
 */
export function subscribeToBooking(
  bookingId: string,
  onUpdate: (booking: Booking | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTION, bookingId),
    (snap) => {
      onUpdate(snap.exists() ? docToBooking(snap.id, snap.data() as Record<string, unknown>) : null);
    },
    (err) => onError?.(err),
  );
}

// ─── UPDATE ────────────────────────────────────────────────────────────────

/**
 * Updates fields on an existing booking document.
 */
export async function updateBooking(
  bookingId: string,
  payload: UpdateBookingPayload,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, bookingId), payload as Record<string, unknown>);
}

/**
 * Assigns a keeper to a booking.
 */
export async function assignKeeper(
  bookingId: string,
  keeperUid: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, bookingId), { assignedKeeper: keeperUid });
}

/**
 * Updates the status of a booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status'],
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, bookingId), { status });
}

// ─── DELETE ────────────────────────────────────────────────────────────────

/**
 * Permanently deletes a booking document (admin only).
 */
export async function deleteBooking(bookingId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, bookingId));
}
