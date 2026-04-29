import type { Timestamp } from 'firebase/firestore';

// ─── Roles ─────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'keeper' | 'admin';

// ─── Status enums ──────────────────────────────────────────────────────────

export type BookingStatus =
  | 'created'
  | 'confirmed'
  | 'picked_up'
  | 'in_transit'
  | 'delivered';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// ─── Shared primitives ─────────────────────────────────────────────────────

export interface GeoLocation {
  address: string;
  lat?: number;
  lng?: number;
}

// ─── Firestore document shapes ─────────────────────────────────────────────

/** Shape of a booking document as stored in Firestore */
export interface FirestoreBooking {
  id: string;
  bookingCode: string;
  customerId: string;
  assignedKeeperId?: string;
  serviceType: string;
  pickupLocation: GeoLocation;
  dropoffLocation: GeoLocation;
  pickupDateTime: string;
  numberOfBags: number;
  totalPrice: number;
  currency: string;
  bookingStatus: BookingStatus | string;
  paymentStatus: PaymentStatus | string;
  notes?: string;
  createdAt?: Timestamp;
}

/** Tracking event in the `bookings/{id}/trackingEvents` subcollection */
export interface TrackingEvent {
  id: string;
  status?: string;
  timestamp?: Timestamp;
  location?: GeoLocation;
}

// ─── Form state ────────────────────────────────────────────────────────────

/** Controlled state for the multi-step booking form */
export interface BookingFormData {
  serviceType: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  numberOfBags: number;
  notes: string;
}

// ─── User profile ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}
