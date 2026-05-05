/**
 * trackingService.ts
 * Full CRUD layer for the `trackingEvents` Firestore collection.
 *
 * Schema (per trackingEvent document):
 *   id, bookingId, status, timestamp, updatedBy
 *
 * TrackingEvents are stored as a top-level collection (not a subcollection)
 * so they can be queried globally by admins and filtered by bookingId.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { TrackingEvent, NewTrackingEventPayload } from '../types';

const COLLECTION = 'trackingEvents';

// ─── Helpers ───────────────────────────────────────────────────────────────

function docToEvent(id: string, data: Record<string, unknown>): TrackingEvent {
  return { id, ...data } as TrackingEvent;
}

// ─── CREATE ────────────────────────────────────────────────────────────────

/**
 * Logs a new tracking event for a booking.
 * `timestamp` is automatically set to server time.
 *
 * @example
 * await addTrackingEvent({
 *   bookingId: 'abc123',
 *   status: 'picked_up',
 *   updatedBy: auth.currentUser!.uid,
 * });
 */
export async function addTrackingEvent(
  payload: NewTrackingEventPayload,
): Promise<TrackingEvent> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...payload,
    timestamp: serverTimestamp(),
  });

  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('TrackingEvent was not created.');
  return docToEvent(snap.id, snap.data() as Record<string, unknown>);
}

// ─── READ (by booking) ─────────────────────────────────────────────────────

/**
 * Fetches all tracking events for a specific booking, ordered oldest-first
 * (so you can render a timeline in chronological order).
 */
export async function getTrackingEventsByBooking(
  bookingId: string,
): Promise<TrackingEvent[]> {
  const q = query(
    collection(db, COLLECTION),
    where('bookingId', '==', bookingId),
    orderBy('timestamp', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToEvent(d.id, d.data() as Record<string, unknown>));
}

// ─── READ (all) ────────────────────────────────────────────────────────────

/**
 * Fetches all tracking events across all bookings (admin use).
 */
export async function getAllTrackingEvents(): Promise<TrackingEvent[]> {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToEvent(d.id, d.data() as Record<string, unknown>));
}

// ─── REAL-TIME LISTENER ────────────────────────────────────────────────────

/**
 * Subscribes to real-time tracking events for a specific booking.
 * Events arrive in chronological order (oldest first).
 *
 * @example
 * const unsub = subscribeToBookingTracking('abc123', setEvents);
 * // on cleanup: unsub();
 */
export function subscribeToBookingTracking(
  bookingId: string,
  onUpdate: (events: TrackingEvent[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('bookingId', '==', bookingId),
    orderBy('timestamp', 'asc'),
  );

  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map(d => docToEvent(d.id, d.data() as Record<string, unknown>)));
    },
    (err) => onError?.(err),
  );
}

/**
 * Subscribes to the latest tracking event for a booking.
 * Useful for showing the current status badge in real time.
 */
export function subscribeToLatestEvent(
  bookingId: string,
  onUpdate: (event: TrackingEvent | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('bookingId', '==', bookingId),
    orderBy('timestamp', 'desc'),
  );

  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        onUpdate(null);
      } else {
        const d = snap.docs[0];
        onUpdate(docToEvent(d.id, d.data() as Record<string, unknown>));
      }
    },
    (err) => onError?.(err),
  );
}
