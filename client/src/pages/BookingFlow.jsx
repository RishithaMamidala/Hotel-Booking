import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBooking } from '../context/BookingContext';
import { hotelsAPI, bookingsAPI, paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { HiCheck, HiCalendar, HiUsers, HiCreditCard, HiExclamationCircle } from 'react-icons/hi';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function CheckoutForm({ booking, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      // Stripe not loaded, use simulation
      try {
        const response = await paymentsAPI.simulate(booking._id);
        if (response.data.success) {
          onSuccess(response.data.booking);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Payment failed');
      }
      setProcessing(false);
      return;
    }

    try {
      const { data } = await paymentsAPI.createIntent(booking._id);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }

    setProcessing(false);
  };

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await paymentsAPI.simulate(booking._id);
      if (response.data.success) {
        onSuccess(response.data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-4">
      {stripePromise ? (
        <form onSubmit={handleSubmit}>
          <div className="border rounded-lg p-4 mb-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={!stripe || processing}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay $${booking.pricing.grandTotal.toFixed(2)}`}
          </button>
        </form>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Stripe is not configured. Using test mode.
          </p>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full btn btn-primary disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay $${booking.pricing.grandTotal.toFixed(2)} (Test Mode)`}
          </button>
        </div>
      )}
    </div>
  );
}

function BookingFlow() {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const {
    hotel,
    room,
    checkIn,
    checkOut,
    guests,
    extras,
    setExtras,
    specialRequests,
    setSpecialRequests,
    calculatePricing,
    resetBooking,
  } = useBooking();

  const [step, setStep] = useState(1);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotel || !room || !checkIn || !checkOut) {
      navigate(`/hotels/${hotelId}`);
      return;
    }
    fetchExtras();
  }, [hotel, room, checkIn, checkOut, hotelId, navigate]);

  const fetchExtras = async () => {
    try {
      const response = await hotelsAPI.getExtras(hotelId);
      setAvailableExtras(response.data.extras);
    } catch (err) {
      console.error('Error fetching extras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraToggle = (extra) => {
    const exists = extras.find((e) => e.name === extra.name);
    if (exists) {
      setExtras(extras.filter((e) => e.name !== extra.name));
    } else {
      setExtras([...extras, { name: extra.name, price: extra.price, quantity: 1 }]);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingsAPI.create({
        hotelId,
        roomId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
        extras,
        specialRequests,
      });
      setBooking(response.data.booking);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    resetBooking();
    navigate('/my-bookings', { state: { success: true } });
  };

  if (loading && step === 1) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const pricing = calculatePricing();

  const steps = [
    { number: 1, title: 'Extras' },
    { number: 2, title: 'Review' },
    { number: 3, title: 'Payment' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= s.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.number ? <HiCheck className="h-6 w-6" /> : s.number}
                </div>
                <span
                  className={`ml-2 font-medium ${
                    step >= s.number ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      step > s.number ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Add Extras to Your Stay</h2>
                {availableExtras.length === 0 ? (
                  <p className="text-gray-500">No extras available for this hotel.</p>
                ) : (
                  <div className="space-y-4">
                    {availableExtras.map((extra) => {
                      const isSelected = extras.some((e) => e.name === extra.name);
                      return (
                        <div
                          key={extra._id}
                          onClick={() => handleExtraToggle(extra)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{extra.name}</h3>
                              {extra.description && (
                                <p className="text-sm text-gray-500">{extra.description}</p>
                              )}
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-primary-600 mr-4">
                                ${extra.price}
                              </span>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-primary-600 text-white'
                                    : 'border-2 border-gray-300'
                                }`}
                              >
                                {isSelected && <HiCheck className="h-4 w-4" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="input"
                    placeholder="Any special requests for your stay..."
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full btn btn-primary"
                >
                  Continue to Review
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-500">
                      {hotel.address.city}, {hotel.address.country}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{format(checkIn, 'EEE, MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{format(checkOut, 'EEE, MMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">{room.name} ({room.type})</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Guests</p>
                    <p className="font-medium">
                      {guests.adults} Adult{guests.adults > 1 ? 's' : ''}
                      {guests.children > 0 && `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}`}
                    </p>
                  </div>

                  {extras.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Extras</p>
                      <ul className="mt-1">
                        {extras.map((extra, index) => (
                          <li key={index} className="text-sm">
                            {extra.name} - ${extra.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {specialRequests && (
                    <div>
                      <p className="text-sm text-gray-500">Special Requests</p>
                      <p className="text-sm">{specialRequests}</p>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  <div className="border-t pt-4">
                    <div className="flex items-start p-3 bg-amber-50 rounded-lg">
                      <HiExclamationCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Cancellation Policy</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Cancellations must be made at least 24 hours before check-in time.
                          Cancellations made less than 24 hours before check-in are not permitted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 btn btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    disabled={loading}
                    className="flex-1 btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && booking && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <HiCreditCard className="h-6 w-6 mr-2" />
                  Payment
                </h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-mono font-semibold">{booking.bookingId}</p>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm booking={booking} onSuccess={handlePaymentSuccess} />
                </Elements>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Price Summary</h3>

              {pricing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ${room.pricePerNight} x {pricing.nights} night{pricing.nights > 1 ? 's' : ''}
                    </span>
                    <span>${pricing.roomTotal.toFixed(2)}</span>
                  </div>

                  {pricing.extrasTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Extras</span>
                      <span>${pricing.extrasTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span>${pricing.taxes.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary-600">${pricing.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <HiCalendar className="h-4 w-4 mr-2" />
                  {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <HiUsers className="h-4 w-4 mr-2" />
                  {guests.adults} Guest{guests.adults > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFlow;
