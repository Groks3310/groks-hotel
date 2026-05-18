import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { paymentsAPI } from '../utils/api'
import { FiCheck, FiDownload, FiHome } from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

const downloadReceipt = async (bookingId, bookingCode) => {
  try {
    const token = localStorage.getItem('token')
    const BASE = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${BASE}/api/receipt/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) throw new Error('Failed')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `GroksHotel-Receipt-${bookingCode}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Receipt downloaded!')
  } catch {
    toast.error('Could not download receipt')
  }
}

export default function PaymentSuccess() {
  const [params] = useSearchParams()
  const reference = params.get('reference') || params.get('trxref')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!reference) { setError(true); setLoading(false); return }
    paymentsAPI.verify(reference)
      .then(r => setBooking(r.data.booking))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [reference])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#C8A96A]/20 border-t-[#C8A96A] rounded-full mx-auto mb-6" />
        <p className="text-[#F7F3EE]/40 tracking-widest text-sm uppercase">Verifying payment...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[rgba(217,108,108,0.1)] border border-[rgba(217,108,108,0.4)] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#D96C6C] text-2xl">✗</span>
        </div>
        <h2 className="luxury-heading text-3xl text-[#F7F3EE] mb-3">Payment Verification Failed</h2>
        <p className="text-[#F7F3EE]/45 text-sm mb-8">We could not verify your payment. Please contact support or check your booking history.</p>
        <div className="flex flex-col gap-3">
          <Link to="/bookings" className="btn-gold text-center">Check Bookings</Link>
          <Link to="/contact" className="btn-outline text-center">Contact Support</Link>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Success header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[rgba(76,175,136,0.1)] border-2 border-[#4CAF88] flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck size={32} className="text-[#4CAF88]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="section-label mb-3">Payment Successful</p>
            <div className="divider-gold" />
            <h1 className="luxury-heading text-5xl text-[#F7F3EE] mt-5 mb-3">
              Booking <span className="italic text-[#C8A96A]">Confirmed</span>
            </h1>
            <p className="text-[#F7F3EE]/45 font-light tracking-wider">
              Your reservation is confirmed. We look forward to welcoming you.
            </p>
          </motion.div>
        </div>

        {booking && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass-card p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking details */}
              <div>
                <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-6">Reservation Details</h3>
                <div className="space-y-4">
                  {[
                    ['Booking Code', booking.bookingCode],
                    ['Room', booking.room?.title],
                    ['Category', booking.room?.category],
                    ['Check-in', new Date(booking.checkIn).toDateString()],
                    ['Check-out', new Date(booking.checkOut).toDateString()],
                    ['Nights', `${booking.nights} night${booking.nights !== 1 ? 's' : ''}`],
                    ['Total Paid', `₦${booking.totalPrice?.toLocaleString()}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#F7F3EE]/35">{label}</span>
                      <span className={`text-sm font-light ${label === 'Booking Code' ? 'text-[#C8A96A] tracking-widest' : label === 'Total Paid' ? 'text-[#C8A96A] luxury-heading text-lg' : 'text-[#F7F3EE]/70'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-white rounded-xl mb-4">
                  <QRCodeSVG
                    value={`GROKS-${booking.bookingCode}-${booking._id}`}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#0B1320"
                  />
                </div>
                <p className="text-[#F7F3EE]/35 text-xs text-center tracking-wider">Scan at check-in</p>
                <p className="text-[#C8A96A] text-sm tracking-widest mt-2">{booking.bookingCode}</p>
              </div>
            </div>

            {/* Confirmation message */}
            <div className="mt-8 p-4 bg-[rgba(76,175,136,0.06)] border border-[rgba(76,175,136,0.2)] rounded-xl text-center">
              <p className="text-[#4CAF88]/80 text-sm font-light tracking-wider">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/" className="btn-outline flex items-center justify-center gap-2 flex-1">
                <FiHome size={14} /> Return Home
              </Link>
              <button onClick={() => downloadReceipt(booking._id, booking.bookingCode)}
                className="btn-gold flex items-center justify-center gap-2 flex-1">
                <FiDownload size={14} /> Download Receipt
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
