import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { roomsAPI, bookingsAPI, paymentsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiCalendar, FiUsers, FiCheck, FiCreditCard } from 'react-icons/fi'

const PH = 'https://placehold.co/600x400/111827/C8A96A?text=Room+Image'

export default function Booking() {
  const { roomId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [paying, setPaying] = useState(false)
  const [step, setStep] = useState(1) // 1: details, 2: summary, 3: payment

  const [form, setForm] = useState({
    checkIn: state?.checkIn || '',
    checkOut: state?.checkOut || '',
    adults: state?.guests || 1,
    children: 0,
    specialRequests: '',
  })

  useEffect(() => {
    roomsAPI.getOne(roomId).then(r => setRoom(r.data.room)).catch(() => navigate('/rooms')).finally(() => setLoading(false))
  }, [roomId])

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0

  const totalPrice = nights * (room?.price || 0)

  const handleSubmitBooking = async () => {
    if (!form.checkIn || !form.checkOut) return toast.error('Please fill in all dates')
    if (nights < 1) return toast.error('Check-out must be after check-in')
    try {
      const res = await bookingsAPI.create({
        room: roomId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: { adults: form.adults, children: form.children },
        specialRequests: form.specialRequests,
      })
      setBooking(res.data.booking)
      setStep(3)
      toast.success('Booking created! Complete payment to confirm.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create booking')
    }
  }

  const handlePaystack = async () => {
    if (!booking) return
    setPaying(true)
    try {
      const res = await paymentsAPI.initialize(booking._id)
      const { authorization_url } = res.data.data
      window.location.href = authorization_url
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed')
      setPaying(false)
    }
  }

  if (loading || !room) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="luxury-heading text-4xl text-[#C8A96A]/30 animate-pulse">Preparing your booking...</div>
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Header */}
      <section className="py-16 px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-label mb-3">Reservation</motion.p>
        <div className="divider-gold" />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="luxury-heading text-5xl text-[#F7F3EE] mt-5">
          Book Your <span className="italic text-[#C8A96A]">Stay</span>
        </motion.h1>
      </section>

      {/* Step indicator */}
      <div className="flex justify-center gap-0 mb-12 px-6">
        {[['1', 'Details'], ['2', 'Summary'], ['3', 'Payment']].map(([num, label], i) => (
          <div key={num} className="flex items-center">
            <div className={`flex flex-col items-center ${step > i + 1 ? 'opacity-100' : step === i + 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-light border transition-all duration-500 ${
                step > i + 1 ? 'bg-[#4CAF88] border-[#4CAF88] text-white' :
                step === i + 1 ? 'bg-[rgba(200,169,106,0.2)] border-[#C8A96A] text-[#C8A96A]' :
                'border-white/20 text-white/30'
              }`}>
                {step > i + 1 ? <FiCheck size={14} /> : num}
              </div>
              <span className="text-[0.55rem] tracking-[0.2em] uppercase mt-2 text-[#F7F3EE]/50">{label}</span>
            </div>
            {i < 2 && <div className={`w-20 h-px mx-2 mb-5 transition-colors duration-500 ${step > i + 1 ? 'bg-[#4CAF88]/50' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            {/* Step 1: Booking Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="glass-card p-8">
                <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-6">Booking Details</h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Check-in Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={14} />
                        <input type="date" value={form.checkIn} min={new Date().toISOString().split('T')[0]}
                          onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))}
                          className="input-luxury pl-10 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Check-out Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={14} />
                        <input type="date" value={form.checkOut} min={form.checkIn || new Date().toISOString().split('T')[0]}
                          onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))}
                          className="input-luxury pl-10 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Adults</label>
                      <div className="relative">
                        <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={14} />
                        <select value={form.adults} onChange={e => setForm(p => ({ ...p, adults: Number(e.target.value) }))}
                          className="input-luxury pl-10 text-sm">
                          {Array.from({ length: room.capacity?.adults || 2 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Children</label>
                      <select value={form.children} onChange={e => setForm(p => ({ ...p, children: Number(e.target.value) }))}
                        className="input-luxury text-sm">
                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Child{n !== 1 ? 'ren' : ''}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Special Requests</label>
                    <textarea value={form.specialRequests} onChange={e => setForm(p => ({ ...p, specialRequests: e.target.value }))}
                      placeholder="Any special requests or preferences? (optional)"
                      rows={4} className="input-luxury resize-none text-sm" />
                  </div>
                </div>

                <button onClick={() => setStep(2)} disabled={!form.checkIn || !form.checkOut || nights < 1}
                  className="btn-gold w-full mt-6 disabled:opacity-40 disabled:cursor-not-allowed">
                  Review Booking
                </button>
              </motion.div>
            )}

            {/* Step 2: Summary */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="glass-card p-8">
                <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-6">Booking Summary</h2>
                <div className="space-y-4 mb-8">
                  {[
                    ['Room', room.title],
                    ['Category', room.category],
                    ['Check-in', new Date(form.checkIn).toDateString()],
                    ['Check-out', new Date(form.checkOut).toDateString()],
                    ['Duration', `${nights} night${nights !== 1 ? 's' : ''}`],
                    ['Guests', `${form.adults} adult${form.adults > 1 ? 's' : ''}${form.children > 0 ? `, ${form.children} child${form.children > 1 ? 'ren' : ''}` : ''}`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-[0.65rem] tracking-[0.2em] uppercase text-[#F7F3EE]/40">{label}</span>
                      <span className="text-[#F7F3EE]/80 text-sm">{val}</span>
                    </div>
                  ))}
                  {form.specialRequests && (
                    <div className="py-3 border-b border-white/5">
                      <div className="text-[0.65rem] tracking-[0.2em] uppercase text-[#F7F3EE]/40 mb-1">Special Requests</div>
                      <div className="text-[#F7F3EE]/60 text-sm">{form.specialRequests}</div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[0.7rem] tracking-[0.25em] uppercase text-[#F7F3EE]/60">Total Amount</span>
                    <span className="luxury-heading text-3xl text-[#C8A96A]">₦{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setStep(1)} className="btn-outline">Edit Details</button>
                  <button onClick={handleSubmitBooking} className="btn-gold">Confirm Booking</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && booking && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="glass-card p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(76,175,136,0.1)] border border-[rgba(76,175,136,0.4)] flex items-center justify-center mx-auto mb-6">
                  <FiCheck size={24} className="text-[#4CAF88]" />
                </div>
                <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-2">Booking Created!</h2>
                <p className="text-[#F7F3EE]/50 text-sm mb-2">Booking Code:</p>
                <div className="luxury-heading text-3xl text-[#C8A96A] mb-6 tracking-widest">{booking.bookingCode}</div>
                <p className="text-[#F7F3EE]/50 text-sm mb-8">
                  Complete your payment to confirm the reservation. We accept bank cards, bank transfer, USSD, Opay & PalmPay.
                </p>

                {/* Payment methods visual */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                  {['Bank Card', 'Bank Transfer', 'USSD', 'Opay', 'PalmPay'].map(m => (
                    <span key={m} className="px-3 py-1.5 glass-card text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/50 rounded-full">{m}</span>
                  ))}
                </div>

                <button onClick={handlePaystack} disabled={paying} className="btn-gold w-full text-sm mb-4 flex items-center justify-center gap-3">
                  <FiCreditCard size={16} />
                  {paying ? 'Redirecting to Paystack...' : `Pay ₦${totalPrice.toLocaleString()}`}
                </button>
                <button onClick={() => navigate('/bookings')} className="btn-outline w-full text-sm">
                  Pay Later (View Bookings)
                </button>
              </motion.div>
            )}
          </div>

          {/* Right: Room Summary */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card overflow-hidden sticky top-28">
              <img src={room.images?.[0]?.url || PH} alt={room.title}
                className="w-full h-52 object-cover"
                onError={e => { e.target.src = PH }} />
              <div className="p-6">
                <span className="section-label text-[0.55rem]">{room.category}</span>
                <h3 className="luxury-heading text-2xl text-[#F7F3EE] mt-2 mb-4">{room.title}</h3>

                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#F7F3EE]/40">Price per night</span>
                    <span className="text-[#F7F3EE]/70">₦{room.price?.toLocaleString()}</span>
                  </div>
                  {nights > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#F7F3EE]/40">Nights</span>
                        <span className="text-[#F7F3EE]/70">{nights}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between">
                        <span className="text-[0.65rem] tracking-wider uppercase text-[#F7F3EE]/50">Total</span>
                        <span className="text-[#C8A96A] luxury-heading text-2xl">₦{totalPrice.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/30 text-center">
                  Secure payment via Paystack
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}