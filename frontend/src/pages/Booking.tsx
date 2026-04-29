import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck } from 'lucide-react';

const Booking: React.FC = () => {
  const [step]                = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    serviceType:    'hotel_to_airport',
    pickupLocation: '',
    dropoffLocation:'',
    pickupDate:     '',
    pickupTime:     '',
    numberOfBags:   2,
    notes:          '',
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const bookingCode = 'DL-' + Math.floor(1000 + Math.random() * 9000);
      const bookingData = {
        bookingCode,
        customerId:      user.uid,
        serviceType:     formData.serviceType,
        pickupLocation:  { address: formData.pickupLocation  || 'Malta International Airport' },
        dropoffLocation: { address: formData.dropoffLocation || 'Intercontinental Hotel St Julians' },
        pickupDateTime:  `${formData.pickupDate || '2024-05-20'}T${formData.pickupTime || '14:30'}:00`,
        numberOfBags:    formData.numberOfBags,
        totalPrice:      formData.numberOfBags * 9.00,
        currency:        'EUR',
        bookingStatus:   'created',
        paymentStatus:   'pending',
        notes:           formData.notes,
        createdAt:       serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      navigate(`/track/${docRef.id}`);
    } catch (err: unknown) {
      setError('Could not create your booking. Please check your connection and try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold display text-navy mb-4">Book Your Service</h1>
          <p className="text-navy/50 text-lg">Let us handle the heavy lifting while you enjoy your freedom of movement.</p>
        </header>

        {/* Progress Tracker */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary/20 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-secondary -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: step === 1 ? '25%' : step === 2 ? '50%' : '100%' }}
            />
            {[
              { id: 1, label: 'Details'  },
              { id: 2, label: 'Delivery' },
              { id: 3, label: 'Payment'  },
            ].map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  s.id < step  ? 'bg-secondary border-secondary text-white' :
                  s.id === step ? 'bg-white border-secondary text-secondary shadow-lg' :
                                  'bg-white border-secondary/20 text-secondary/30'
                }`}>
                  {s.id < step ? '✓' : s.id}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${s.id <= step ? 'text-secondary' : 'text-navy/30'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white p-10 rounded-[2rem] shadow-soft border border-navy/5">
            <h2 className="text-2xl font-bold display text-navy mb-10">Service Details</h2>

            {error && (
              <div className="mb-8 px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-navy/60">Service Type</label>
                <div className="relative">
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full h-14 pl-6 pr-12 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none appearance-none font-medium text-navy/80"
                  >
                    <option value="hotel_to_airport">Hotel to Airport Transfer</option>
                    <option value="airport_to_hotel">Airport to Hotel Transfer</option>
                    <option value="inter_hotel">Inter-Hotel Transfer</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-navy/40 text-xs">▼</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-navy/60">Pickup Date</label>
                  <input
                    type="date"
                    className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
                    onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-navy/60">Pickup Time</label>
                  <input
                    type="time"
                    className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-navy/60">Number of Bags</label>
                <div className="flex items-center gap-6">
                  <div className="flex-1 flex items-center justify-between h-14 px-6 bg-surface rounded-xl border border-navy/5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, numberOfBags: Math.max(1, formData.numberOfBags - 1) })}
                      className="text-2xl text-secondary font-bold hover:opacity-70 transition-opacity"
                    >
                      —
                    </button>
                    <span className="text-xl font-bold display">{formData.numberOfBags}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, numberOfBags: Math.min(6, formData.numberOfBags + 1) })}
                      className="text-2xl text-secondary font-bold hover:opacity-70 transition-opacity"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs text-navy/40 font-medium">Max 6 bags per booking</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-deep transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Continue to Delivery'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square bg-[#0a121d] rounded-[2rem] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1614741484745-66770bc106f3?q=80&w=1974"
                alt="Tech illustration"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest rounded-md">Premium Care</span>
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Service Experience</span>
                </div>
                <h3 className="text-3xl font-bold display mb-4">Effortless Transfers</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  We track your flight and arrival times automatically. Relax knowing your belongings are in safe hands at all times.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-secondary-soft/10 rounded-2xl border border-secondary/10 flex flex-col gap-4">
                <ShieldCheck className="text-secondary" size={24} />
                <div>
                  <h4 className="font-bold text-navy text-sm">CCTV Protected</h4>
                  <p className="text-[10px] text-navy/40">Secure monitoring 24/7</p>
                </div>
              </div>
              <div className="p-6 bg-secondary-soft/10 rounded-2xl border border-secondary/10 flex flex-col gap-4">
                <ShieldCheck className="text-secondary" size={24} />
                <div>
                  <h4 className="font-bold text-navy text-sm">Fully Insured</h4>
                  <p className="text-[10px] text-navy/40">Up to €3,000 per bag</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
