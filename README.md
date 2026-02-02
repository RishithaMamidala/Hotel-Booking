# Hotel Booking & Management System

A full-stack MERN hotel booking and management system with user authentication, room reservations, payment processing, reviews, and admin dashboard.

## Features

- **User Authentication**: Google OAuth via Passport.js
- **Hotel Browsing**: Search, filter, and view hotel details
- **Room Booking**: Multi-step booking flow with date selection and extras
- **Payment Processing**: Stripe integration for secure payments
- **Review System**: Post-stay reviews with verified badges
- **Email Notifications**: Booking confirmations, cancellations, and reminders
- **Admin Dashboard**: Manage hotels, rooms, bookings, users, and generate reports

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js, Passport.js
- **Database**: MongoDB with Mongoose
- **Payments**: Stripe
- **Email**: SendGrid (Nodemailer)
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google OAuth credentials
- Stripe account (for payments)
- SendGrid account (for emails)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-booking
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- MongoDB connection string
- Google OAuth credentials
- Stripe API keys
- SendGrid API key

4. Seed the database (optional):
```bash
cd server
node utils/seedData.js
```

5. Start development servers:
```bash
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

## Project Structure

```
hotel-booking/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   └── admin/         # Admin dashboard pages
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   └── utils/             # Helper utilities
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                    # Express backend
│   ├── config/                # Configuration (DB, Passport)
│   ├── controllers/           # Route controllers
│   ├── middleware/            # Express middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── services/              # Business logic (email, stripe)
│   ├── utils/                 # Helper utilities
│   └── server.js              # Entry point
│
├── .env.example               # Environment variables template
├── package.json               # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Hotels
- `GET /api/hotels` - List hotels (with filters)
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:id/availability` - Check availability
- `GET /api/hotels/:id/extras` - Get hotel extras

### Bookings
- `GET /api/bookings` - List bookings (admin)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook
- `POST /api/payments/simulate` - Test payment (dev mode)

### Reviews
- `GET /api/reviews/hotel/:hotelId` - Get hotel reviews
- `POST /api/reviews` - Create review

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Revenue analytics
- `GET /api/admin/reports` - Generate PDF reports

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hotel-booking
SESSION_SECRET=your-secret

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@yourhotel.com

# Frontend
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

## Testing Without External Services

The application includes fallbacks for testing without Stripe and SendGrid:

- **Payments**: Use `/api/payments/simulate` to confirm bookings without Stripe
- **Emails**: Emails are logged to console when SendGrid is not configured

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Railway/Render)
1. Create a new service
2. Connect your repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster
2. Configure network access
3. Get connection string
4. Update `MONGODB_URI` in environment

## License

MIT
