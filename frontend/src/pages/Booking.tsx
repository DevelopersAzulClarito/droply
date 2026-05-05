import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  ShieldCheck, Check, Calendar, Clock,
  Minus, Plus, ArrowRight, MapPin, Package,
} from 'lucide-react';
import type { BookingFormData } from '../types';

const PRICE_PER_BAG = 9;

const STEP_LABELS = ['Details', 'Delivery', 'Confirm'] as const;

const INITIAL_FORM: BookingFormData = {
  name:    '',
  phone:   '',
  email:   '',
  pickup:  '',
  dropoff: '',
  date:    '',
  time:    '',
  bags:    1,
};

function validateStep(step: number, data: BookingFormData): string | null {
  if (step === 2) {
    if (!data.pickup.trim())  return 'Pickup location is required.';
    if (!data.dropoff.trim()) return 'Dropoff location is required.';
    if (!data.date)           return 'Pickup date is required.';
    if (!data.time)           return 'Pickup time is required.';
  }
  return null;
}

const Booking: React.FC = () => {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM);

  const navigate = useNavigate();
  const { user }  = useAuth();

  const totalPrice = formData.bags * PRICE_PER_BAG;

  const patch = (updates: Partial<BookingFormData>) =>
    setFormData(prev => ({ ...prev, ...updates }));

  const handleNext = () => {
    const err = validateStep(step, formData);
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    setLoading(true);
    setError(null);
    try {
      const bookingCode = 'DRP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const docRef = await addDoc(collection(db, 'bookings'), {
        bookingCode,
        customerId: user.uid,           // UID for secure Dashboard queries
        name:      user.displayName ?? user.email ?? '',
        phone:     '',
        email:     user.email ?? '',
        pickup:    formData.pickup,
        dropoff:   formData.dropoff,
        date:      formData.date,
        time:      formData.time,
        bags:      formData.bags,
        price:     totalPrice,
        status:    'pending',
        createdAt: serverTimestamp(),
      });
      navigate(`/track/${docRef.id}`);
    } catch {
      setError('Could not create your booking. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#181c1c] font-['Plus_Jakarta_Sans'] pt-28 pb-24 px-4 sm:px-6 md:px-8 selection:bg-[#78f7e8] selection:text-[#007168]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#181c1c] mb-4 tracking-tight">
            Book Your Service
          </h1>
          <p className="text-base sm:text-lg text-[#887361]">
            Let us handle the heavy lifting while you enjoy your freedom of movement.
          </p>
        </header>

        {/* Step indicator */}
        <div className="relative max-w-xs sm:max-w-md mx-auto mb-16 px-2">
          <div className="absolute top-5 left-0 w-full h-1 bg-[#78f7e8]/40 z-0" />
          <div
            className="absolute top-5 left-0 h-1 bg-[#006a62] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          <div className="relative z-10 flex justify-between">
            {STEP_LABELS.map((label, idx) => {
              const n    = idx + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={n} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    done   ? 'bg-[#006a62] text-white shadow-md'                              :
                    active ? 'bg-[#006a62] text-white shadow-md ring-4 ring-[#006a62]/20'    :
                             'bg-white border-2 border-[#78f7e8] text-[#887361]'
                  }`}>
                    {done ? <Check size={16} strokeWidth={3} /> : n}
                  </div>
                  <span className={`mt-2.5 text-xs font-bold ${n <= step ? 'text-[#006a62]' : 'text-[#887361]'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── Form panel ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,106,98,0.15)]">

            {error && (
              <div className="mb-6 px-5 py-4 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl text-sm text-[#93000a] font-bold">
                {error}
              </div>
            )}

            {/* ── Step 1: Bags ─────────────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#181c1c]">Service Details</h2>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#181c1c] block">Number of Bags</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center justify-between border border-[#78f7e8] rounded-xl p-2 flex-1">
                      <button
                        type="button"
                        aria-label="Remove one bag"
                        disabled={formData.bags <= 1}
                        onClick={() => patch({ bags: Math.max(1, formData.bags - 1) })}
                        className="w-12 h-12 rounded-lg hover:bg-[#78f7e8]/30 disabled:opacity-40 flex items-center justify-center text-[#006a62] transition-colors"
                      >
                        <Minus size={20} strokeWidth={3} />
                      </button>
                      <span className="text-2xl font-bold w-8 text-center select-none">
                        {formData.bags}
                      </span>
                      <button
                        type="button"
                        aria-label="Add one bag"
                        disabled={formData.bags >= 6}
                        onClick={() => patch({ bags: Math.min(6, formData.bags + 1) })}
                        className="w-12 h-12 rounded-lg hover:bg-[#78f7e8]/30 disabled:opacity-40 flex items-center justify-center text-[#006a62] transition-colors"
                      >
                        <Plus size={20} strokeWidth={3} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff9800]" />
                      <span className="text-xs font-bold text-[#887361]">
                        Max 6 bags · €{PRICE_PER_BAG}/bag
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ebeeed]">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full h-14 bg-[#ff9800] text-white rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(255,152,0,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Delivery <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Locations + schedule ───────────────────────── */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#181c1c]">Pickup & Delivery</h2>

                <div className="space-y-3">
                  <label htmlFor="pickupLocation" className="text-sm font-bold text-[#181c1c] block">
                    Pickup Location <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="pickupLocation"
                      type="text"
                      placeholder="e.g. Hilton Malta, St. Julian's"
                      value={formData.pickup}
                      onChange={(e) => patch({ pickup: e.target.value })}
                      className="w-full bg-white border border-[#78f7e8] rounded-xl pl-12 pr-5 py-4 font-medium text-[#181c1c] placeholder:text-[#a1b2c8] focus:outline-none focus:ring-2 focus:ring-[#006a62]/20 focus:border-[#006a62] transition-all"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006a62] pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="dropoffLocation" className="text-sm font-bold text-[#181c1c] block">
                    Dropoff Location <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="dropoffLocation"
                      type="text"
                      placeholder="e.g. Malta International Airport"
                      value={formData.dropoff}
                      onChange={(e) => patch({ dropoff: e.target.value })}
                      className="w-full bg-white border border-[#78f7e8] rounded-xl pl-12 pr-5 py-4 font-medium text-[#181c1c] placeholder:text-[#a1b2c8] focus:outline-none focus:ring-2 focus:ring-[#006a62]/20 focus:border-[#006a62] transition-all"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff9800] pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="pickupDate" className="text-sm font-bold text-[#181c1c] block">
                      Pickup Date <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="pickupDate"
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={(e) => patch({ date: e.target.value })}
                        className="w-full bg-white border border-[#78f7e8] rounded-xl pl-5 pr-12 py-4 font-medium text-[#181c1c] focus:outline-none focus:ring-2 focus:ring-[#006a62]/20 focus:border-[#006a62] transition-all appearance-none"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#887361] pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="pickupTime" className="text-sm font-bold text-[#181c1c] block">
                      Pickup Time <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="pickupTime"
                        type="time"
                        value={formData.time}
                        onChange={(e) => patch({ time: e.target.value })}
                        className="w-full bg-white border border-[#78f7e8] rounded-xl pl-5 pr-12 py-4 font-medium text-[#181c1c] focus:outline-none focus:ring-2 focus:ring-[#006a62]/20 focus:border-[#006a62] transition-all appearance-none"
                      />
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#887361] pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ebeeed] flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-14 w-full sm:w-auto px-8 border-2 border-[#e0e3e2] text-[#4f6073] rounded-xl font-bold text-sm hover:border-[#006a62] hover:text-[#006a62] transition-all flex items-center justify-center"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="h-14 flex-1 bg-[#ff9800] text-white rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(255,152,0,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Confirmation <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Summary + submit ────────────────────────────── */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#181c1c]">Confirm Booking</h2>

                {/* Order summary */}
                <div className="bg-[#f7faf9] border border-[#e0e3e2] rounded-2xl p-5 sm:p-6 space-y-4">

                  <SummaryRow
                    icon={<MapPin size={15} className="text-[#006a62]" />}
                    label="From"
                    value={formData.pickup}
                  />
                  <SummaryRow
                    icon={<MapPin size={15} className="text-[#ff9800]" />}
                    label="To"
                    value={formData.dropoff}
                  />
                  <div className="h-px bg-[#e0e3e2]" />
                  <SummaryRow
                    icon={<Calendar size={15} className="text-[#4f6073]" />}
                    label="Date & Time"
                    value={`${formData.date} at ${formData.time}`}
                  />
                  <div className="h-px bg-[#e0e3e2]" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Total</p>
                      <p className="text-[10px] text-[#a1b2c8] mt-0.5">
                        {formData.bags} bag{formData.bags > 1 ? 's' : ''} × €{PRICE_PER_BAG}.00
                      </p>
                    </div>
                    <span className="text-2xl font-extrabold text-[#006a62]">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>


                <div className="pt-6 border-t border-[#ebeeed] flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="h-14 w-full sm:w-auto px-8 border-2 border-[#e0e3e2] text-[#4f6073] rounded-xl font-bold text-sm hover:border-[#006a62] hover:text-[#006a62] disabled:opacity-50 transition-all flex items-center justify-center"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-14 flex-1 bg-[#ff9800] text-white rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(255,152,0,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm & Book'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Right sidebar ───────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-video lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg group bg-[#0a121d]">
              <img
                alt="Luggage service in Malta"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuHaDZOnUAiKL1Vp2xyO7U5uIQ0qaU3-YHMn3hdBLK9ctsCK0m244zmHL-BVsi1-nEvWq0o2Ar31A0bBwxlgLKP9beKYKCWSo888Cd4aNucRa1HGeBbFcd8p3YrULMrg68foK5tFZgkt28_OcH-jlQCC_yCxP_2jXehZy628y9NCRWszM-w7aKMFoVAU5qdsVGP_xoxytE-jntnX44YVv0bqg89p8aglrvORjCMlMRJBEN3-0cxiiRNkiDA1Li_ko6zcb2hyZ4-t4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-10">
                <span className="bg-[#ff9800] text-white px-3 py-1 rounded-full font-bold text-[10px] w-fit mb-3 uppercase tracking-widest">
                  Premium Care
                </span>
                <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">Effortless Transfers</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  We track your flight and arrival times automatically. Relax knowing your belongings are in safe hands.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TrustBadge title="CCTV Protected" sub="Secure monitoring 24/7" />
              <TrustBadge title="Fully Insured"  sub="Up to €3,000 per bag"  />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const SummaryRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-2 text-[#4f6073] shrink-0 pt-0.5">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{label}</span>
    </div>
    <span className="text-sm font-bold text-[#181c1c] text-right break-words min-w-0">{value}</span>
  </div>
);

const TrustBadge: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div className="bg-[#78f7e8]/10 border border-[#78f7e8] p-5 rounded-2xl flex flex-col items-start gap-3">
    <div className="w-10 h-10 rounded-full bg-[#006a62]/10 flex items-center justify-center shrink-0">
      <ShieldCheck className="text-[#006a62]" size={20} />
    </div>
    <div>
      <p className="font-bold text-[#006a62] text-sm">{title}</p>
      <p className="text-[10px] text-[#4f6073] uppercase tracking-wider mt-1">{sub}</p>
    </div>
  </div>
);

export default Booking;
