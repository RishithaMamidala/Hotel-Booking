const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Extra = require('../models/Extra');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Extra.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user (will be linked when you sign in with Google)
    const admin = await User.create({
      email: 'rmamidala361@gmail.com',
      name: 'Rishi Mamidala',
      role: 'admin',
    });
    console.log('Created admin user');

    // Create hotels
    const hotels = await Hotel.create([
      {
        name: 'Grand Plaza Hotel',
        description: 'Experience luxury at its finest in the heart of New York City. Our 5-star hotel offers stunning views, world-class dining, and impeccable service.',
        address: {
          street: '123 Fifth Avenue',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 },
        },
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
        ],
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Concierge'],
        policies: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          cancellationPolicy: { freeCancellationDays: 3, refundPercentage: 100 },
        },
        rating: { average: 0, count: 0 },
        isActive: true,
      },
      {
        name: 'Seaside Resort & Spa',
        description: 'A beachfront paradise offering the perfect blend of relaxation and adventure. Wake up to ocean views and fall asleep to the sound of waves.',
        address: {
          street: '456 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          country: 'USA',
          zipCode: '33139',
          coordinates: { lat: 25.7617, lng: -80.1918 },
        },
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ],
        amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Water Sports', 'Restaurant', 'Bar'],
        policies: {
          checkInTime: '16:00',
          checkOutTime: '10:00',
          cancellationPolicy: { freeCancellationDays: 5, refundPercentage: 80 },
        },
        rating: { average: 0, count: 0 },
        isActive: true,
      },
      {
        name: 'Mountain Lodge Retreat',
        description: 'Escape to the mountains and reconnect with nature. Cozy cabins, breathtaking views, and outdoor adventures await.',
        address: {
          street: '789 Pine Trail',
          city: 'Aspen',
          state: 'CO',
          country: 'USA',
          zipCode: '81611',
          coordinates: { lat: 39.1911, lng: -106.8175 },
        },
        images: [
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1518602164578-cd0074062767?w=800',
        ],
        amenities: ['WiFi', 'Fireplace', 'Ski Storage', 'Hot Tub', 'Restaurant', 'Hiking Trails'],
        policies: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          cancellationPolicy: { freeCancellationDays: 7, refundPercentage: 100 },
        },
        rating: { average: 0, count: 0 },
        isActive: true,
      },
    ]);
    console.log('Created hotels');

    // Create rooms for each hotel
    const roomTemplates = [
      {
        name: 'Standard Room',
        type: 'single',
        description: 'A comfortable room perfect for solo travelers. Features a queen-size bed and all essential amenities.',
        capacity: { adults: 1, children: 0 },
        pricePerNight: 150,
        amenities: ['WiFi', 'TV', 'Mini Fridge', 'Coffee Maker'],
        quantity: 10,
      },
      {
        name: 'Deluxe Double',
        type: 'double',
        description: 'Spacious room with a king-size bed, perfect for couples. Enjoy city views and premium amenities.',
        capacity: { adults: 2, children: 1 },
        pricePerNight: 250,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Coffee Maker', 'Balcony'],
        quantity: 15,
      },
      {
        name: 'Family Suite',
        type: 'suite',
        description: 'A large suite with separate living area, ideal for families. Features two bedrooms and a fully equipped kitchenette.',
        capacity: { adults: 4, children: 2 },
        pricePerNight: 400,
        amenities: ['WiFi', 'TV', 'Full Kitchen', 'Living Room', 'Balcony', 'Washer/Dryer'],
        quantity: 5,
      },
      {
        name: 'Executive Deluxe',
        type: 'deluxe',
        description: 'Premium room with luxury furnishings, stunning views, and exclusive access to the executive lounge.',
        capacity: { adults: 2, children: 0 },
        pricePerNight: 500,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi', 'Executive Lounge Access', 'Premium Toiletries'],
        quantity: 8,
      },
      {
        name: 'Penthouse Suite',
        type: 'penthouse',
        description: 'The ultimate luxury experience. Panoramic views, private terrace, butler service, and world-class amenities.',
        capacity: { adults: 4, children: 2 },
        pricePerNight: 1500,
        amenities: ['WiFi', 'TV', 'Full Kitchen', 'Private Terrace', 'Butler Service', 'Private Hot Tub'],
        quantity: 2,
      },
    ];

    const roomImages = [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
    ];

    for (const hotel of hotels) {
      const rooms = await Room.create(
        roomTemplates.map((template, index) => ({
          ...template,
          hotel: hotel._id,
          images: [roomImages[index]],
        }))
      );

      hotel.rooms = rooms.map((r) => r._id);
      await hotel.save();
    }
    console.log('Created rooms');

    // Create extras for each hotel
    const extraTemplates = [
      { name: 'Breakfast Buffet', description: 'Daily breakfast with international options', price: 25, type: 'breakfast' },
      { name: 'Airport Transfer', description: 'Private car service to/from airport', price: 75, type: 'other' },
      { name: 'Parking', description: 'Secure underground parking', price: 35, type: 'parking' },
      { name: 'Late Checkout', description: 'Extend checkout until 3 PM', price: 50, type: 'late-checkout' },
      { name: 'Spa Package', description: '60-minute massage and spa access', price: 150, type: 'spa' },
    ];

    for (const hotel of hotels) {
      const extras = await Extra.create(
        extraTemplates.map((template) => ({
          ...template,
          hotel: hotel._id,
          isActive: true,
        }))
      );

      hotel.extras = extras.map((e) => e._id);
      await hotel.save();
    }
    console.log('Created extras');

    console.log('Seed data completed successfully!');
    console.log('Admin login: rmamidala361@gmail.com (sign in with Google)');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
