import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [imgError, setImgError] = useState(false) // 👈 Track image loading status safely
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropOpen(false)
    setImgError(false) // 👈 Reset image error flag when path routes change
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out. Until next time.')
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0B1320]/95 backdrop-blur-xl border-b border-[rgba(200,169,106,0.15)] shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-light tracking-[0.15em] text-[#F7F3EE]">
            GROKS
          </span>
          <span className="text-[0.55rem] font-light tracking-[0.4em] text-[#C8A96A] uppercase">
            Hotel & Resort
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-[0.7rem] font-light tracking-[0.25em] uppercase transition-all duration-300 hover:text-[#C8A96A] ${
                location.pathname === to ? 'text-[#C8A96A]' : 'text-[#F7F3EE]/80'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-full border border-[#C8A96A]/40 flex items-center justify-center bg-[rgba(200,169,106,0.1)] text-[#C8A96A] group-hover:border-[#C8A96A] transition-all overflow-hidden">
                  <div className="w-9 h-9 rounded-full border border-[#C8A96A]/40 flex items-center justify-center bg-[rgba(200,169,106,0.1)] text-[#C8A96A] group-hover:border-[#C8A96A] transition-all overflow-hidden">
  // ── UPDATED NAVBAR IMAGE CONTAINER ──
<div className="w-9 h-9 rounded-full border border-[#C8A96A]/40 flex items-center justify-center bg-[rgba(200,169,106,0.1)] text-[#C8A96A] overflow-hidden">
  {user && user.avatar ? (
    <img 
      src={user.avatar.startsWith('http') ? user.avatar : `https://groks-hotel-backend.onrender.com${user.avatar}`} 
      alt={user.name} 
      className="w-full h-full object-cover" 
      
      // 🌟 THE FOOLPROOF FIX: If the backend returns a 404, this event swaps it instantly!
      onError={(e) => {
        e.target.onerror = null; // Stops infinite loops if the fallback image fails
        e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Clean default icon
      }}
    />
  ) : (
    <FiUser size={16} />
  )}
</div>
</div>
                </div>
                <span className="text-[0.7rem] tracking-[0.15em] uppercase text-[#F7F3EE]/80 group-hover:text-[#C8A96A] transition-colors">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-52 glass-card py-2 shadow-2xl"
                  >
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-5 py-3 text-[0.75rem] tracking-widest uppercase text-[#C8A96A] hover:bg-white/5 transition-colors">
                        <FiSettings size={14} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/profile" className="flex items-center gap-3 px-5 py-3 text-[0.75rem] tracking-widest uppercase text-[#F7F3EE]/80 hover:text-[#C8A96A] hover:bg-white/5 transition-colors">
                      <FiUser size={14} /> My Profile
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-3 px-5 py-3 text-[0.75rem] tracking-widest uppercase text-[#F7F3EE]/80 hover:text-[#C8A96A] hover:bg-white/5 transition-colors">
                      My Bookings
                    </Link>
                    <div className="border-t border-white/10 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-3 text-[0.75rem] tracking-widest uppercase text-[#D96C6C]/80 hover:text-[#D96C6C] hover:bg-white/5 w-full text-left transition-colors">
                      <FiLogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[0.7rem] tracking-[0.2em] uppercase text-[#F7F3EE]/70 hover:text-[#C8A96A] transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-gold text-[0.65rem] py-2.5 px-6">
                Join
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#F7F3EE] hover:text-[#C8A96A] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden bg-[#0B1320]/98 backdrop-blur-xl border-t border-[rgba(200,169,106,0.1)] px-6 pb-8 pt-4"
          >
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="block py-3 text-[0.75rem] tracking-[0.25em] uppercase text-[#F7F3EE]/80 hover:text-[#C8A96A] transition-colors border-b border-white/5">
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="block py-3 text-[0.75rem] tracking-[0.25em] uppercase text-[#F7F3EE]/80 hover:text-[#C8A96A] transition-colors border-b border-white/5">My Profile</Link>
                <Link to="/bookings" className="block py-3 text-[0.75rem] tracking-[0.25em] uppercase text-[#F7F3EE]/80 hover:text-[#C8A96A] transition-colors border-b border-white/5">My Bookings</Link>
                {user.role === 'admin' && <Link to="/admin" className="block py-3 text-[0.75rem] tracking-[0.25em] uppercase text-[#C8A96A] border-b border-white/5">Admin Panel</Link>}
                <button onClick={handleLogout} className="block py-3 text-[0.75rem] tracking-[0.25em] uppercase text-[#D96C6C]/80 mt-2">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-4 mt-6">
                <Link to="/login" className="btn-outline flex-1 text-center">Sign In</Link>
                <Link to="/register" className="btn-gold flex-1 text-center">Join</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}