# 🏨 Groks Hotel & Resort — Full Stack Application

A ultra-premium luxury hotel booking platform with real-time availability, Paystack payments, and an admin dashboard.

---

## 🚀 Quick Start

### 1. Install Frontend Dependencies

```bash
# In the root folder (Groks-Hotel/)
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# - MONGO_URI: your MongoDB Atlas connection string
# - JWT_SECRET: any long random string
# - PAYSTACK_SECRET_KEY: from Paystack dashboard
# - EMAIL_USER / EMAIL_PASS: for booking confirmations
```

### 4. Run Backend

```bash
cd backend
npm run dev       # development (nodemon)
npm start         # production
```

### 5. Run Frontend

```bash
# In root folder
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## 📁 Project Structure

```
Groks-Hotel/
├── backend/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT + role guard
│   │   └── error.js           # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/                # Express routers
│   ├── uploads/               # File uploads (auto-created)
│   ├── server.js              # Entry point + Socket.io
│   └── .env.example
│
├── src/
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   ├── common/            # StarRating, LoadingScreen, ProtectedRoute
│   │   └── rooms/             # RoomCard
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state
│   ├── pages/
│   │   ├── Home.jsx           # Landing page
│   │   ├── Rooms.jsx          # Room listing + filters
│   │   ├── RoomDetails.jsx    # Room detail + booking panel
│   │   ├── Booking.jsx        # 3-step booking flow
│   │   ├── BookingHistory.jsx # User reservations
│   │   ├── PaymentSuccess.jsx # QR code confirmation
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── AdminDashboard.jsx # Full admin panel
│   │   └── NotFound.jsx       # 404
│   ├── utils/api.js           # Axios instance + all API calls
│   └── styles/globals.css     # Luxury design tokens
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔑 Creating First Admin

After registering a user, go to MongoDB and update the user's `role` field to `"admin"`:

```json
{ "$set": { "role": "admin" } }
```

---

## 💳 Paystack Setup

1. Create account at [paystack.com](https://paystack.com)
2. Get your secret key from Settings > API Keys
3. Add to `backend/.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_live_...
   PAYSTACK_PUBLIC_KEY=pk_live_...
   ```
4. For testing use `sk_test_...` and `pk_test_...`

Supported payment methods: Bank Card, Bank Transfer, USSD, Opay, PalmPay

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# From root
npm run build
# Deploy /dist folder to Vercel
# Set VITE_API_URL env var to your backend URL
```

### Backend → Render

1. Connect your GitHub repo to Render
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add all env vars from `.env.example`

---

## ⚡ Real-Time Features (Socket.io)

- Live room availability when a booking is made
- Instant booking status updates across all clients
- Admin receives live alerts for new bookings
- No page refresh needed

---

## 🎨 Design System

| Token         | Value     |
| ------------- | --------- |
| Navy (bg)     | `#0B1320` |
| Ivory (text)  | `#F7F3EE` |
| Gold (accent) | `#C8A96A` |
| Sand          | `#D8C3A5` |
| Bronze        | `#A58E6F` |
| Success       | `#4CAF88` |
| Error         | `#D96C6C` |

Fonts: Cormorant Garamond (headings) + Jost (body)

---

## 📝 API Endpoints

| Method | Endpoint                    | Access |
| ------ | --------------------------- | ------ |
| POST   | `/api/auth/register`        | Public |
| POST   | `/api/auth/login`           | Public |
| GET    | `/api/rooms`                | Public |
| GET    | `/api/rooms/:id`            | Public |
| POST   | `/api/bookings`             | User   |
| GET    | `/api/bookings/my`          | User   |
| POST   | `/api/payments/initialize`  | User   |
| GET    | `/api/payments/verify/:ref` | User   |
| GET    | `/api/admin/stats`          | Admin  |
| GET    | `/api/bookings/all`         | Admin  |

---

Built with ❤️ — Groks Hotel & Resort © 2024
