import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import ChatBot from './components/common/ChatBot'

import Home from './pages/Home'
import Rooms from './pages/Rooms'
import RoomDetails from './pages/RoomDetails'
import Booking from './pages/Booking'
import BookingHistory from './pages/BookingHistory'
import PaymentSuccess from './pages/PaymentSuccess'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import About from './pages/About'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function Layout() {
  const location = useLocation()
  const hideFooter = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-[#0B1320] text-[#F7F3EE]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/booking/:roomId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <ChatBot />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2540',
              color: '#F7F3EE',
              border: '1px solid rgba(200,169,106,0.2)',
              borderRadius: '8px',
              fontFamily: '"Jost", sans-serif',
              fontSize: '0.85rem',
              fontWeight: '300',
              letterSpacing: '0.03em',
            },
            success: { iconTheme: { primary: '#4CAF88', secondary: '#1a2540' } },
            error: { iconTheme: { primary: '#D96C6C', secondary: '#1a2540' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}