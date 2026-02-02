// Calculate number of nights between dates (minimum 1 night)
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1); // Minimum 1 night
};

// Calculate booking pricing
const calculatePricing = (pricePerNight, nights, extras = [], taxRate = 0.1) => {
  const roomTotal = pricePerNight * nights;
  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0);
  const subtotal = roomTotal + extrasTotal;
  const taxes = Math.round(subtotal * taxRate * 100) / 100;
  const grandTotal = Math.round((subtotal + taxes) * 100) / 100;

  return {
    roomTotal,
    extrasTotal,
    taxes,
    grandTotal,
  };
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Check if cancellation is free based on policy
const isFreeCancellation = (checkIn, freeCancellationDays) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const diffTime = checkInDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= freeCancellationDays;
};

// Check if cancellation is allowed (must be at least 24 hours before check-in)
const isCancellationAllowed = (checkIn) => {
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const diffTime = checkInDate - now;
  const diffHours = diffTime / (1000 * 60 * 60);
  return diffHours >= 24;
};

// Calculate refund amount based on policy
const calculateRefund = (grandTotal, checkIn, policy) => {
  if (isFreeCancellation(checkIn, policy.freeCancellationDays)) {
    return grandTotal * (policy.refundPercentage / 100);
  }
  return 0;
};

module.exports = {
  calculateNights,
  calculatePricing,
  formatDate,
  isFreeCancellation,
  isCancellationAllowed,
  calculateRefund,
};
