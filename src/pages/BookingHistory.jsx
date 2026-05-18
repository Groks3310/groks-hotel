import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bookingsAPI, paymentsAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiCreditCard, FiX, FiDownload } from 'react-icons/fi'
import ConfirmModal from '../components/common/ConfirmModal'

const STATUS_STYLES = {
  confirmed: 'text-[#4CAF88] bg-[rgba(76,175,136,0.1)] border-[rgba(76,175,136,0.3)]',
  pending: 'text-[#C8A96A] bg-[rgba(200,169,106,0.1)] border-[rgba(200,169,106,0.3)]',
  cancelled: 'text-[#D96C6C] bg-[rgba(217,108,108,0.1)] border-[rgba(217,108,108,0.3)]',
  completed: 'text-[#A58E6F] bg-[rgba(165,142,111,0.1)] border-[rgba(165,142,111,0.3)]',
}

const PAY_STYLES = {
  paid: 'text-[#4CAF88]',
  pending: 'text-[#C8A96A]',
  failed: 'text-[#D96C6C]',
  refunded: 'text-[#A58E6F]',
}

const handleDownloadReceipt = async (bookingId, bookingCode) => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/receipt/${bookingId}`, {
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

export default function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [cancelling, setCancelling] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ open: false, bookingId: null })

  useEffect(() => {
    bookingsAPI.getMy()
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancelClick = (id) => {
    setConfirmModal({ open: true, bookingId: id })
  }

  const handleCancelConfirm = async () => {
    const id = confirmModal.bookingId
    setConfirmModal({ open: false, bookingId: null })
    setCancelling(id)
    try {
      await bookingsAPI.cancel(id)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: 'cancelled' } : b))
      toast.success('Booking cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking')
    } finally { setCancelling(null) }
  }

  const handlePayNow = async (bookingId) => {
    try {
      const res = await paymentsAPI.initialize(bookingId)
      window.location.href = res.data.data.authorization_url
    } catch { toast.error('Payment initialization failed') }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.bookingStatus === filter)

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Cancel Booking"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Yes, Cancel"
        danger={true}
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmModal({ open: false, bookingId: null })}
      />

      {/* Header */}
      <section className="py-16 px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-label mb-3">Account</motion.p>
        <div className="divider-gold" />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="luxury-heading text-5xl text-[#F7F3EE] mt-5">
          My <span className="italic text-[#C8A96A]">Reservations</span>
        </motion.h1>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[0.6rem] tracking-[0.2em] uppercase rounded-sm transition-all duration-300 ${
                filter === f
                  ? 'bg-[#C8A96A] text-[#0B1320]'
                  : 'border border-white/15 text-[#F7F3EE]/50 hover:border-[#C8A96A]/50 hover:text-[#C8A96A]'
              }`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-32 shimmer rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass-card">
            <div className="luxury-heading text-6xl text-[#C8A96A]/20 mb-4">∅</div>
            <h3 className="luxury-heading text-3xl text-[#F7F3EE]/40 mb-4">No Reservations Found</h3>
            <Link to="/rooms" className="btn-gold inline-block">Explore Rooms</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((b, i) => (
              <motion.div key={b._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-card p-6 hover:border-[rgba(200,169,106,0.3)] transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  {/* Room image */}
                  <img
                    src={b.room?.images?.[0]?.url || '/section4.jpg'}
                    alt={b.room?.title}
                    className="w-full md:w-28 h-24 object-cover rounded-xl shrink-0"
                    onError={e => { e.target.src = '/section4.jpg' }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="luxury-heading text-xl text-[#F7F3EE]">{b.room?.title || 'Room'}</h3>
                        <span className="text-[0.6rem] tracking-[0.2em] uppercase text-[#F7F3EE]/40">{b.room?.category}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 text-[0.55rem] tracking-wider uppercase rounded-full border ${STATUS_STYLES[b.bookingStatus] || ''}`}>
                          {b.bookingStatus}
                        </span>
                        <span className={`text-[0.55rem] tracking-wider uppercase ${PAY_STYLES[b.paymentStatus] || ''}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-5 text-[#F7F3EE]/45 text-xs mb-3">
                      <span className="flex items-center gap-1.5"><FiCalendar size={11} /> {new Date(b.checkIn).toDateString()}</span>
                      <span>→ {new Date(b.checkOut).toDateString()}</span>
                      <span>{b.nights} night{b.nights !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[0.55rem] tracking-wider uppercase text-[#F7F3EE]/30 block">Booking Code</span>
                        <span className="text-[#C8A96A] text-sm font-light tracking-widest">{b.bookingCode}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[0.55rem] tracking-wider uppercase text-[#F7F3EE]/30 block">Total</span>
                        <span className="text-[#C8A96A] luxury-heading text-xl">₦{b.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Link to={`/rooms/${b.room?._id}`}
                      className="btn-outline text-[0.6rem] py-2 px-4 text-center">
                      View Room
                    </Link>
                    {b.paymentStatus === 'paid' && (
                      <button onClick={() => handleDownloadReceipt(b._id, b.bookingCode)}
                        className="btn-gold text-[0.6rem] py-2 px-4 flex items-center justify-center gap-1.5">
                        <FiDownload size={11} /> Receipt
                      </button>
                    )}
                    {b.paymentStatus === 'pending' && b.bookingStatus !== 'cancelled' && (
                      <button onClick={() => handlePayNow(b._id)}
                        className="btn-gold text-[0.6rem] py-2 px-4 flex items-center justify-center gap-1.5">
                        <FiCreditCard size={11} /> Pay Now
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(b.bookingStatus) && (
                      <button onClick={() => handleCancelClick(b._id)} disabled={cancelling === b._id}
                        className="text-[0.6rem] tracking-wider uppercase text-[#D96C6C]/70 hover:text-[#D96C6C] transition-colors py-2 px-4 border border-[rgba(217,108,108,0.2)] hover:border-[rgba(217,108,108,0.4)] rounded-sm flex items-center justify-center gap-1.5">
                        <FiX size={11} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
