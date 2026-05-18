import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { roomsAPI, reviewsAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/common/StarRating'
import toast from 'react-hot-toast'
import { FiUsers, FiMaximize2, FiCheck, FiArrowLeft, FiCalendar, FiStar } from 'react-icons/fi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const PH = '/section4.jpg'

export default function RoomDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [availability, setAvailability] = useState(null)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    Promise.all([
      roomsAPI.getOne(id),
      reviewsAPI.getRoomReviews(id)
    ]).then(([rRoom, rRevs]) => {
      setRoom(rRoom.data.room)
      setReviews(rRevs.data.reviews)
    }).catch(() => navigate('/rooms'))
      .finally(() => setLoading(false))
  }, [id])

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) return toast.error('Please select dates first')
    setCheckingAvail(true)
    try {
      const res = await roomsAPI.checkAvailability({ roomId: id, checkIn, checkOut })
      setAvailability(res.data.available)
      if (res.data.available) toast.success('Room is available for your dates!')
      else toast.error('Room is not available for selected dates')
    } catch { toast.error('Could not check availability') }
    finally { setCheckingAvail(false) }
  }

  const handleBookNow = () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return }
    if (!checkIn || !checkOut) { toast.error('Please select dates first'); return }
    navigate(`/booking/${id}`, { state: { checkIn, checkOut, guests } })
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Sign in to leave a review'); return }
    setSubmittingReview(true)
    try {
      const res = await reviewsAPI.create({ roomId: id, rating: reviewRating, comment: reviewText })
      setReviews(prev => [res.data.review, ...prev])
      setReviewText('')
      setReviewRating(5)
      toast.success('Review submitted. Thank you!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review')
    } finally { setSubmittingReview(false) }
  }

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="luxury-heading text-5xl text-[#C8A96A]/20 animate-pulse">Loading...</div>
      </div>
    </div>
  )

  if (!room) return null

  const images = room.images?.length ? room.images : [{ url: PH }]

  return (
    <div className="min-h-screen pt-20 pb-24">

      {/* Back */}
      <div className="px-6 max-w-7xl mx-auto pt-6 pb-2">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-[#F7F3EE]/40 hover:text-[#C8A96A] text-sm tracking-wider transition-colors">
          <FiArrowLeft size={14} /> Back to Rooms
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="px-6 max-w-7xl mx-auto mt-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-2xl overflow-hidden"
          style={{ height: '520px' }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img.url || PH} alt={img.alt || room.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = PH }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/90 via-[#0B1320]/20 to-[#0B1320]/30" />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Main Content */}
      <section className="px-6 max-w-7xl mx-auto mt-12">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* ── LEFT: Room Info ── */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="section-label text-[0.6rem]">{room.category}</span>
              <h1 className="luxury-heading text-5xl text-[#F7F3EE] mt-3 mb-4">{room.title}</h1>

              {/* Rating + Status */}
              <div className="flex items-center gap-6 mb-6 flex-wrap">
                {room.rating?.count > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(room.rating.average)} readonly size={14} />
                    <span className="text-[#F7F3EE]/50 text-sm">{room.rating.average} ({room.rating.count} reviews)</span>
                  </div>
                )}
                <span className={`px-3 py-1 text-[0.6rem] tracking-wider uppercase rounded-full border ${
                  room.isAvailable
                    ? 'border-[rgba(76,175,136,0.4)] text-[#4CAF88] bg-[rgba(76,175,136,0.1)]'
                    : 'border-[rgba(217,108,108,0.4)] text-[#D96C6C] bg-[rgba(217,108,108,0.1)]'
                }`}>
                  {room.isAvailable ? 'Available' : 'Occupied'}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-8 text-[#F7F3EE]/50 text-sm flex-wrap">
                <span className="flex items-center gap-2"><FiUsers size={14} /> Up to {room.capacity?.adults} guests</span>
                {room.size > 0 && <span className="flex items-center gap-2"><FiMaximize2 size={14} /> {room.size} m²</span>}
                {room.floor > 0 && <span>Floor {room.floor}</span>}
              </div>

              <div className="divider-gold" style={{ margin: '0 0 24px 0' }} />

              <p className="text-[#F7F3EE]/60 font-light leading-relaxed text-base mb-10">{room.description}</p>

              {/* Amenities */}
              {room.amenities?.length > 0 && (
                <div className="mb-10">
                  <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-6">Room Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {room.amenities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 text-[#F7F3EE]/60 text-sm">
                        <FiCheck size={13} className="text-[#C8A96A] shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT: Booking Panel ── */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="glass-card p-8 sticky top-28"
            >
              <div className="mb-6">
                <span className="text-[0.6rem] tracking-[0.3em] uppercase text-[#F7F3EE]/40">Price per night</span>
                <div className="luxury-heading text-4xl text-[#C8A96A] mt-1">
                  ₦{room.price?.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Check-in</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={14} />
                    <input type="date" value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setCheckIn(e.target.value); setAvailability(null) }}
                      className="input-luxury pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Check-out</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={14} />
                    <input type="date" value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => { setCheckOut(e.target.value); setAvailability(null) }}
                      className="input-luxury pl-10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-luxury text-sm">
                    {Array.from({ length: room.capacity?.adults || 2 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price summary */}
              {nights > 0 && (
                <div className="glass-card p-4 mb-5 bg-[rgba(200,169,106,0.05)]">
                  <div className="flex justify-between text-sm text-[#F7F3EE]/60 mb-2">
                    <span>₦{room.price?.toLocaleString()} × {nights} nights</span>
                    <span>₦{(room.price * nights).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-[0.65rem] tracking-wider uppercase text-[#F7F3EE]/50">Total</span>
                    <span className="text-[#C8A96A] luxury-heading text-xl">₦{(room.price * nights).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Availability result */}
              {availability !== null && (
                <div className={`text-center text-xs tracking-wider uppercase py-2 px-4 rounded mb-4 ${
                  availability
                    ? 'text-[#4CAF88] bg-[rgba(76,175,136,0.1)] border border-[rgba(76,175,136,0.3)]'
                    : 'text-[#D96C6C] bg-[rgba(217,108,108,0.1)] border border-[rgba(217,108,108,0.3)]'
                }`}>
                  {availability ? '✓ Available for selected dates' : '✗ Not available for these dates'}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button onClick={checkAvailability} disabled={checkingAvail || !checkIn || !checkOut}
                  className="btn-outline w-full text-[0.65rem]">
                  {checkingAvail ? 'Checking...' : 'Check Availability'}
                </button>
                <button onClick={handleBookNow} disabled={availability === false}
                  className="btn-gold w-full text-[0.7rem] disabled:opacity-40 disabled:cursor-not-allowed">
                  Reserve Now
                </button>
              </div>

              <p className="text-center text-[#F7F3EE]/25 text-xs mt-4 tracking-wider">No payment charged until confirmed</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS SECTION — Full width below ── */}
      <section className="px-6 max-w-7xl mx-auto mt-20">
        <div className="divider-gold" style={{ margin: '0 0 40px 0' }} />

        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="section-label mb-2">Guest Experiences</p>
            <h2 className="luxury-heading text-4xl text-[#F7F3EE]">
              Reviews & <span className="italic text-[#C8A96A]">Ratings</span>
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="text-center glass-card px-6 py-4">
              <div className="luxury-heading text-4xl text-[#C8A96A]">{room.rating?.average || 0}</div>
              <div className="flex justify-center my-1">
                <StarRating rating={Math.round(room.rating?.average || 0)} readonly size={13} />
              </div>
              <div className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/35">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>

        {/* Write a review */}
        {user ? (
          <div className="glass-card p-8 mb-10 border border-[rgba(200,169,106,0.2)]">
            <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-2">Share Your Experience</h3>
            <p className="text-[#F7F3EE]/40 text-sm mb-6 font-light">How was your stay in this room?</p>

            <form onSubmit={submitReview}>
              {/* Star rating picker */}
              <div className="mb-6">
                <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-3">Your Rating</label>
                <StarRating rating={reviewRating} onRate={setReviewRating} size={28} />
              </div>

              {/* Review text */}
              <div className="mb-6">
                <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-3">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Tell other guests about your experience — the ambiance, service, comfort, and anything that stood out..."
                  rows={5}
                  required
                  className="input-luxury resize-none"
                />
              </div>

              <button type="submit" disabled={submittingReview} className="btn-gold">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-card p-8 mb-10 text-center border border-[rgba(200,169,106,0.15)]">
            <div className="text-[#C8A96A]/40 text-4xl mb-4">✦</div>
            <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-3">Share Your Experience</h3>
            <p className="text-[#F7F3EE]/40 text-sm mb-6 font-light">Sign in to leave a review for this room</p>
            <Link to="/login" className="btn-gold inline-block">Sign In to Review</Link>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <div className="text-[#C8A96A]/20 text-6xl mb-4">✦</div>
            <h3 className="luxury-heading text-2xl text-[#F7F3EE]/40 mb-2">No Reviews Yet</h3>
            <p className="text-[#F7F3EE]/25 text-sm italic">Be the first to share your experience in this room.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="glass-card p-6 hover:border-[rgba(200,169,106,0.3)] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[rgba(200,169,106,0.1)] border border-[rgba(200,169,106,0.3)] flex items-center justify-center text-[#C8A96A] luxury-heading text-lg">
                      {rev.user?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <div className="text-[#F7F3EE]/80 text-sm font-light">{rev.user?.name || 'Guest'}</div>
                      <div className="text-[#F7F3EE]/30 text-xs mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} readonly size={13} />
                </div>
                <p className="text-[#F7F3EE]/60 text-sm font-light leading-relaxed italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
