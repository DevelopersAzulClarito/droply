import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Package, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';

const Booking: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    serviceType: 'airport_to_hotel',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    numberOfBags: 1,
    notes: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const bookingCode = 'DRP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingData = {
        bookingCode,
        customerId: auth.currentUser.uid,
        serviceType: formData.serviceType,
        pickupLocation: { address: formData.pickupLocation },
        dropoffLocation: { address: formData.dropoffLocation },
        pickupDateTime: `${formData.pickupDate}T${formData.pickupTime}:00`,
        numberOfBags: formData.numberOfBags,
        totalPrice: formData.numberOfBags * 15, // Simple pricing logic
        currency: 'EUR',
        bookingStatus: 'created',
        paymentStatus: 'pending',
        notes: formData.notes,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      navigate(`/track/${docRef.id}`);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-24 px-6">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tighter mb-4 italic serif">Book Your Service</h1>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-stone-900' : 'bg-stone-200'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-8">Service Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Service Type</label>
                <select 
                  className="w-full p-4 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-stone-900"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                >
                  <option value="airport_to_hotel">Airport to Hotel</option>
                  <option value="hotel_to_airport">Hotel to Airport</option>
                  <option value="cruise_to_hotel">Cruise Port to Hotel</option>
                  <option value="point_to_point">Point-to-Point</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Pickup Date</label>
                  <input 
                    type="date" 
                    className="w-full p-4 bg-stone-50 rounded-xl border-none"
                    value={formData.pickupDate}
                    onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Pickup Time</label>
                  <input 
                    type="time" 
                    className="w-full p-4 bg-stone-50 rounded-xl border-none"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            <button type="button" onClick={handleNext} className="w-full mt-10 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all">
              Next Step
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-8">Locations & Items</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Pickup Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Malta International Airport"
                  className="w-full p-4 bg-stone-50 rounded-xl border-none"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Delivery Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hilton Malta, St. Julian's"
                  className="w-full p-4 bg-stone-50 rounded-xl border-none"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData({...formData, dropoffLocation: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Number of Bags</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-4 bg-stone-50 rounded-xl border-none"
                  value={formData.numberOfBags}
                  onChange={(e) => setFormData({...formData, numberOfBags: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={handleBack} className="flex-1 border border-stone-200 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all">Back</button>
              <button type="button" onClick={handleNext} className="flex-[2] bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all">Review & Pay</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-8">Review Summary</h2>
            <div className="bg-stone-50 p-6 rounded-2xl space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-stone-500">Service</span>
                <span className="font-bold uppercase text-xs tracking-widest">{formData.serviceType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pickup</span>
                <span className="font-bold text-sm">{formData.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Delivery</span>
                <span className="font-bold text-sm">{formData.dropoffLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Items</span>
                <span className="font-bold">{formData.numberOfBags} Bags</span>
              </div>
              <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">€{formData.numberOfBags * 15}.00</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button type="button" onClick={handleBack} className="flex-1 border border-stone-200 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all">Back</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all disabled:opacity-50">
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
};

export default Booking;
