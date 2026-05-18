import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowDown, FiStar, FiArrowRight } from 'react-icons/fi'
import { roomsAPI } from '../utils/api'
import RoomCard from '../components/rooms/RoomCard'

const AMENITIES = [
  { icon: '🏊', title: 'Infinity Pool', desc: 'Rooftop pool with panoramic city skyline views' },
  { icon: '🧖', title: 'Luxury Spa', desc: 'World-class treatments with premium products' },
  { icon: '🍽️', title: 'Fine Dining', desc: 'Award-winning cuisine by international chefs' },
  { icon: '🏋️', title: 'Fitness Center', desc: 'State-of-the-art equipment open 24/7' },
  { icon: '🚗', title: 'Valet Parking', desc: 'Complimentary valet for all guests' },
  { icon: '✈️', title: 'Airport Transfer', desc: 'Private luxury vehicle at your service' },
]

const TESTIMONIALS = [
  { name: 'Amara Okafor', location: 'Lagos', text: 'An unparalleled experience of elegance. Every detail was perfectly curated. I have stayed at many luxury hotels but Groks redefines the standard.', rating: 5 },
  { name: 'Emeka Nwosu', location: 'Abuja', text: 'The Presidential Suite was breathtaking. The staff anticipated every need before we even expressed it. Truly world-class service.', rating: 5 },
  { name: 'Chidinma Eze', location: 'Port Harcourt', text: 'From check-in to check-out, every moment felt like a dream. The ambiance, the food, the rooms — absolute perfection.', rating: 5 },
]

const GALLERY = [
  { src: '/section1.jpg', span: 'row-span-2' },
  { src: '/section4.jpg', span: '' },
  { src: '/section5.jpg', span: '' },
  { src: '/section2.jpg', span: '' },
  { src: '/hotelHero.jpg', span: '' },
]

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState([])
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    roomsAPI.getAll({ featured: 'true' })
      .then(r => setFeaturedRooms(r.data.rooms.slice(0, 3)))
      .catch(() => {})
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] } })
  }

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src="/hotelHero.jpg"
            alt="Groks Hotel"
            className="w-full h-full object-cover"
          />
          {/* Elegant overlay — not too dark so image breathes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/80 via-[#0B1320]/50 to-[#0B1320]/80" />
        </motion.div>

        <motion.div className="relative z-10 text-center px-6 max-w-5xl mx-auto" style={{ opacity: heroOpacity }}>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0} className="section-label mb-6">
            Welcome to Groks Hotel & Resort
          </motion.p>
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="luxury-heading text-6xl md:text-8xl lg:text-9xl text-[#F7F3EE] mb-8"
          >
            Where Luxury<br />
            <span className="italic text-[#C8A96A]">Finds Its Voice</span>
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-[#F7F3EE]/75 text-lg font-light tracking-wider max-w-xl mx-auto mb-12">
            An intimate sanctuary of refined elegance in the heart of Lagos
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rooms" className="btn-gold text-sm">Explore Suites</Link>
            <Link to="/about" className="btn-outline text-sm">Our Story</Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#C8A96A]/80"
        >
          <span className="text-[0.6rem] tracking-[0.3em] uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <FiArrowDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <section className="py-5 border-y border-[rgba(200,169,106,0.15)] bg-[#080e1a] overflow-hidden">
        <div className="flex gap-20 whitespace-nowrap animate-marquee">
          {['Luxury Rooms & Suites', 'Fine Dining Experience', 'Infinity Pool', 'World-Class Spa', 'Concierge Service', 'Airport Transfer',
            'Luxury Rooms & Suites', 'Fine Dining Experience', 'Infinity Pool', 'World-Class Spa', 'Concierge Service', 'Airport Transfer'].map((t, i) => (
            <span key={i} className="text-[0.65rem] tracking-[0.35em] uppercase text-[#C8A96A]/50 shrink-0">{t}</span>
          ))}
        </div>
      </section>

      {/* ── ABOUT / LOBBY SECTION ── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label mb-4">About the Hotel</p>
            <div className="divider-gold" style={{ margin: '0 0 24px 0' }} />
            <h2 className="luxury-heading text-5xl md:text-6xl text-[#F7F3EE] mb-8 leading-tight">
              A Legacy of <span className="italic text-[#C8A96A]">Excellence</span>
            </h2>
            <p className="text-[#F7F3EE]/65 font-light leading-relaxed mb-6">
              Nestled in the prestigious heart of Lagos, Groks Hotel & Resort stands as a monument to refined living. Our philosophy is simple: every guest deserves the extraordinary.
            </p>
            <p className="text-[#F7F3EE]/55 font-light leading-relaxed mb-10">
              From our bespoke suites to our award-winning culinary experiences, we craft every moment with meticulous attention to detail, ensuring memories that last a lifetime.
            </p>
            <div className="grid grid-cols-3 gap-8 mb-10">
              {[['15+', 'Years of Excellence'], ['200+', 'Luxury Rooms'], ['98%', 'Guest Satisfaction']].map(([num, label]) => (
                <div key={label}>
                  <div className="luxury-heading text-4xl text-[#C8A96A] mb-1">{num}</div>
                  <div className="text-[0.65rem] tracking-wider uppercase text-[#F7F3EE]/40">{label}</div>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-outline inline-flex items-center gap-3">
              Discover Our Story <FiArrowRight size={14} />
            </Link>
          </motion.div>

          {/* section1.jpg — warm lobby interior */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
              <img src="/section1.jpg" alt="Hotel Lobby" className="w-full object-cover" style={{ height: '620px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/60 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-card p-6 shadow-2xl">
              <div className="flex items-center gap-1 text-[#C8A96A] mb-1">
                {[1,2,3,4,5].map(i => <FiStar key={i} size={12} className="fill-current" />)}
              </div>
              <div className="luxury-heading text-2xl text-[#F7F3EE]">5-Star Rated</div>
              <div className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/40 mt-1">Luxury Hotel</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="section-label mb-4">Accommodations</p>
          <div className="divider-gold" />
          <h2 className="luxury-heading text-5xl md:text-6xl text-[#F7F3EE] mt-6">
            Our <span className="italic text-[#C8A96A]">Signature</span> Suites
          </h2>
        </motion.div>

        {featuredRooms.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {featuredRooms.map((room, i) => <RoomCard key={room._id} room={room} index={i} />)}
          </div>
        ) : (
          /* Showcase cards using real images */
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { cat: 'Deluxe Room', img: '/section4.jpg', price: '85,000', desc: 'Elegantly appointed rooms with city views, premium bedding, and curated amenities.' },
              { cat: 'Executive Suite', img: '/section1.jpg', price: '150,000', desc: 'Expansive suites with a private lounge, butler service, and panoramic vistas.' },
              { cat: 'Presidential Suite', img: '/section5.jpg', price: '350,000', desc: 'The pinnacle of luxury — a private sanctuary with bespoke furnishings and full concierge.' },
            ].map(({ cat, img, price, desc }, i) => (
              <motion.div key={cat}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card overflow-hidden group hover:border-[rgba(200,169,106,0.4)] transition-all duration-500"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>
                <div className="h-64 overflow-hidden relative">
                  <img src={img} alt={cat} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[0.6rem] tracking-[0.25em] uppercase text-[#C8A96A] bg-[rgba(11,19,32,0.7)] px-3 py-1 rounded-full border border-[rgba(200,169,106,0.3)]">{cat}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-3 group-hover:text-[#C8A96A] transition-colors">{cat}</h3>
                  <p className="text-[#F7F3EE]/55 text-sm mb-5 leading-relaxed">{desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-[0.55rem] tracking-wider uppercase text-[#F7F3EE]/35 block">From</span>
                      <span className="text-[#C8A96A] luxury-heading text-xl">₦{price}<span className="text-xs text-[#F7F3EE]/35">/night</span></span>
                    </div>
                    <Link to="/rooms" className="btn-gold text-[0.65rem] py-2.5 px-5">Explore</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/rooms" className="btn-outline inline-flex items-center gap-3">
            View All Rooms <FiArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── SPLIT FEATURE — Hotel Exterior ── */}
      <section className="relative py-0 overflow-hidden" style={{ height: '500px' }}>
        <img src="/section2.jpg" alt="Hotel Exterior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1320]/90 via-[#0B1320]/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-10 md:px-24">
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.9 }}
            className="max-w-lg"
          >
            <p className="section-label mb-4">Prime Location</p>
            <div className="divider-gold" style={{ margin: '0 0 20px 0' }} />
            <h2 className="luxury-heading text-5xl text-[#F7F3EE] mb-5 leading-tight">
              In the Heart of <span className="italic text-[#C8A96A]">Lagos</span>
            </h2>
            <p className="text-[#F7F3EE]/65 font-light mb-8 leading-relaxed">
              Positioned in the prestigious Victoria Island district, Groks Hotel offers seamless access to business hubs, fine dining, and the vibrant culture of Nigeria's most dynamic city.
            </p>
            <Link to="/contact" className="btn-gold">Get Directions</Link>
          </motion.div>
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section className="py-24 px-6 bg-[#080e1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="section-label mb-4">World-Class Facilities</p>
            <div className="divider-gold" />
            <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6">
              Amenities <span className="italic text-[#C8A96A]">Beyond Compare</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {AMENITIES.map((a, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card p-8 text-center hover:border-[rgba(200,169,106,0.35)] transition-all duration-500 group">
                <div className="text-4xl mb-4">{a.icon}</div>
                <h3 className="luxury-heading text-xl text-[#F7F3EE] group-hover:text-[#C8A96A] transition-colors mb-2">{a.title}</h3>
                <p className="text-[#F7F3EE]/45 text-sm font-light">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <p className="section-label mb-4">Visual Journey</p>
          <div className="divider-gold" />
          <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6">
            Gallery of <span className="italic text-[#C8A96A]">Moments</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[220px]">
          {/* Large featured image */}
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="row-span-2 relative overflow-hidden rounded-2xl group cursor-pointer">
            <img src="/section1.jpg" alt="Gallery" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#C8A96A]/0 group-hover:bg-[#C8A96A]/10 transition-all duration-500" />
          </motion.div>

          {['/section4.jpg', '/section2.jpg', '/room5.jpg', '/hotelHero.jpg'].map((src, i) => (
            <motion.div key={i}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.08}
              className="relative overflow-hidden rounded-2xl group cursor-pointer">
              <img src={src} alt={`Gallery ${i+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[#C8A96A]/0 group-hover:bg-[#C8A96A]/10 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 bg-[#080e1a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label mb-4">Guest Voices</p>
            <div className="divider-gold" />
            <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6 mb-16">
              Stories of <span className="italic text-[#C8A96A]">Delight</span>
            </h2>
          </motion.div>

          <div className="relative min-h-[220px]">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: i === activeTestimonial ? 1 : 0, y: i === activeTestimonial ? 0 : 20 }}
                transition={{ duration: 0.7 }}
                className={`absolute inset-0 ${i === activeTestimonial ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <div className="flex justify-center mb-5">
                  {[1,2,3,4,5].map(s => <FiStar key={s} size={16} className="text-[#C8A96A] fill-current mx-0.5" />)}
                </div>
                <blockquote className="luxury-heading text-2xl md:text-3xl text-[#F7F3EE]/85 font-light italic leading-relaxed mb-8">
                  "{t.text}"
                </blockquote>
                <div>
                  <div className="text-[#C8A96A] font-light tracking-widest uppercase text-sm">{t.name}</div>
                  <div className="text-[#F7F3EE]/35 text-xs tracking-wider mt-1">{t.location}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`h-0.5 transition-all duration-500 ${i === activeTestimonial ? 'bg-[#C8A96A] w-10' : 'bg-white/20 w-4'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER — room1.jpg ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/room1.jpg" alt="Hotel Entrance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1320]/95 via-[#0B1320]/85 to-[#0B1320]/60" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label mb-4">Reserve Your Escape</p>
            <div className="divider-gold" />
            <h2 className="luxury-heading text-5xl md:text-6xl text-[#F7F3EE] mt-6 mb-6">
              Begin Your <span className="italic text-[#C8A96A]">Luxury Journey</span>
            </h2>
            <p className="text-[#F7F3EE]/65 font-light mb-10 text-lg leading-relaxed">
              Immerse yourself in a world of elegance. Book your suite today and let us craft an unforgettable story for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/rooms" className="btn-gold">Book Your Suite</Link>
              <Link to="/contact" className="btn-outline">Contact Concierge</Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}