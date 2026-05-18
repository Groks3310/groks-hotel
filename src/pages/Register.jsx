import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Register() {
  const nameRef = useRef()
  const emailRef = useRef()
  const phoneRef = useRef()
  const passwordRef = useRef()
  const confirmRef = useRef()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const password = passwordRef.current.value
    const confirm = confirmRef.current.value
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(nameRef.current.value, emailRef.current.value, password, phoneRef.current.value)
      toast.success('Welcome to Groks Hotel.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="/hotelHero.jpg" alt="bg" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#0B1320]/70" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card p-10">
          <div className="text-center mb-10">
            <Link to="/">
              <div className="font-serif text-3xl font-light tracking-[0.2em] text-[#F7F3EE]">GROKS</div>
              <div className="text-[0.5rem] tracking-[0.5em] text-[#C8A96A] uppercase mt-1">Hotel & Resort</div>
            </Link>
            <div className="divider-gold mt-6" />
            <h1 className="luxury-heading text-3xl text-[#F7F3EE] mt-6">Create Account</h1>
            <p className="text-[#F7F3EE]/40 text-sm mt-2 font-light">Join the world of luxury</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input ref={nameRef} type="text" placeholder="Your full name" required autoComplete="name" className="input-luxury pl-11" />
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input ref={emailRef} type="email" placeholder="your@email.com" required autoComplete="email" className="input-luxury pl-11" />
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Phone Number (optional)</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input ref={phoneRef} type="tel" placeholder="+234 800 000 0000" autoComplete="tel" className="input-luxury pl-11" />
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input ref={passwordRef} type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" required autoComplete="new-password" className="input-luxury pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F7F3EE]/30 hover:text-[#C8A96A] transition-colors">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input ref={confirmRef} type={showPass ? 'text' : 'password'} placeholder="Repeat password" required autoComplete="new-password" className="input-luxury pl-11" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[#F7F3EE]/35 text-sm mt-8 font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C8A96A] hover:text-[#D8C3A5] transition-colors tracking-wider">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}