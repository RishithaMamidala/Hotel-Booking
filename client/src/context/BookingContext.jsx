import { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext(null);

const initialState = {
  hotel: null,
  room: null,
  checkIn: null,
  checkOut: null,
  guests: { adults: 1, children: 0 },
  extras: [],
  specialRequests: '',
  pricing: null,
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_HOTEL':
      return { ...state, hotel: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload };
    case 'SET_DATES':
      return { ...state, checkIn: action.payload.checkIn, checkOut: action.payload.checkOut };
    case 'SET_GUESTS':
      return { ...state, guests: action.payload };
    case 'SET_EXTRAS':
      return { ...state, extras: action.payload };
    case 'ADD_EXTRA':
      return { ...state, extras: [...state.extras, action.payload] };
    case 'REMOVE_EXTRA':
      return { ...state, extras: state.extras.filter(e => e.name !== action.payload) };
    case 'SET_SPECIAL_REQUESTS':
      return { ...state, specialRequests: action.payload };
    case 'SET_PRICING':
      return { ...state, pricing: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setHotel = (hotel) => dispatch({ type: 'SET_HOTEL', payload: hotel });
  const setRoom = (room) => dispatch({ type: 'SET_ROOM', payload: room });
  const setDates = (checkIn, checkOut) => dispatch({ type: 'SET_DATES', payload: { checkIn, checkOut } });
  const setGuests = (guests) => dispatch({ type: 'SET_GUESTS', payload: guests });
  const setExtras = (extras) => dispatch({ type: 'SET_EXTRAS', payload: extras });
  const addExtra = (extra) => dispatch({ type: 'ADD_EXTRA', payload: extra });
  const removeExtra = (name) => dispatch({ type: 'REMOVE_EXTRA', payload: name });
  const setSpecialRequests = (requests) => dispatch({ type: 'SET_SPECIAL_REQUESTS', payload: requests });
  const setPricing = (pricing) => dispatch({ type: 'SET_PRICING', payload: pricing });
  const resetBooking = () => dispatch({ type: 'RESET' });

  const calculateNights = () => {
    if (!state.checkIn || !state.checkOut) return 0;
    const diffTime = Math.abs(new Date(state.checkOut) - new Date(state.checkIn));
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(nights, 1); // Minimum 1 night
  };

  const calculatePricing = () => {
    if (!state.room || !state.checkIn || !state.checkOut) return null;

    const nights = calculateNights();
    const roomTotal = state.room.pricePerNight * nights;
    const extrasTotal = state.extras.reduce((sum, extra) => sum + (extra.price * extra.quantity), 0);
    const subtotal = roomTotal + extrasTotal;
    const taxes = Math.round(subtotal * 0.1 * 100) / 100;
    const grandTotal = Math.round((subtotal + taxes) * 100) / 100;

    return { roomTotal, extrasTotal, taxes, grandTotal, nights };
  };

  const value = {
    ...state,
    setHotel,
    setRoom,
    setDates,
    setGuests,
    setExtras,
    addExtra,
    removeExtra,
    setSpecialRequests,
    setPricing,
    resetBooking,
    calculateNights,
    calculatePricing,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
