import type { Timestamp } from 'firebase/firestore';

// ─── Roles ─────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'keeper' | 'customer';

// ─── Booking Status ────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'stored'
  | 'delivered'
  | 'cancelled';

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: Timestamp;
}

// ─── Booking ───────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  bookingCode: string;
  /** Customer's display name */
  name: string;
  /** Customer's phone number */
  phone: string;
  /** Customer's email */
  email: string;
  /** Pickup address / location description */
  pickup: string;
  /** Drop-off address / location description */
  dropoff: string;
  /** Date of the service (ISO string, e.g. "2026-05-10") */
  date: string;
  /** Time of the service (e.g. "14:30") */
  time: string;
  /** Number of bags */
  bags: number;
  /** Total price in the service currency */
  price: number;
  status: BookingStatus;
  /** UID of the keeper assigned to this booking */
  assignedKeeper?: string;
  createdAt: Timestamp;
}

/** Payload used when creating a new booking (id and createdAt are generated server-side) */
export type NewBookingPayload = Omit<Booking, 'id' | 'createdAt'>;

/** Payload used when updating a booking (all fields optional except id) */
export type UpdateBookingPayload = Partial<Omit<Booking, 'id' | 'createdAt'>>;

// ─── TrackingEvent ─────────────────────────────────────────────────────────

export interface TrackingEvent {
  id: string;
  bookingId: string;
  status: BookingStatus | string;
  timestamp: Timestamp;
  /** UID of the user who triggered this event */
  updatedBy: string;
}

/** Payload used when creating a new tracking event */
export type NewTrackingEventPayload = Omit<TrackingEvent, 'id' | 'timestamp'>;

// ─── Form helpers ──────────────────────────────────────────────────────────

/** Controlled state for the multi-step booking form */
export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  bags: number;
}
