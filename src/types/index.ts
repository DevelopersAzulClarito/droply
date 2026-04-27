// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'keeper' | 'admin';

// ─── Booking states ──────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'picked_up' | 'in_transit' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// ─── Shared primitives ───────────────────────────────────────────────────────

export interface BagCount {
  small: number;
  medium: number;
  large: number;
}

export interface GeoLocation {
  address: string;
  lat?: number;
  lng?: number;
}

// ─── Domain models ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

export interface Booking {
  id: string;
  bookingCode: string;       // human-readable, e.g. "DRP-2026-0042"
  customerId: string;
  pickup: GeoLocation;
  dropoff: GeoLocation;
  date: string;              // ISO 8601: 'YYYY-MM-DD'
  time: string;              // 'HH:mm' (24h)
  bags: BagCount;
  price: number;             // total in EUR cents
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  assignedKeeperId: string | null;
}
