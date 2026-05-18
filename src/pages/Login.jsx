import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back.')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="https://placehold.co/1920x1080/0d1b2a/C8A96A?text=Groks+Hotel" alt="bg" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-radial from-[#0B1320]/50 to-[#0B1320]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-10">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-block">
              <div className="font-serif text-3xl font-light tracking-[0.2em] text-[#F7F3EE]">GROKS</div>
              <div className="text-[0.5rem] tracking-[0.5em] text-[#C8A96A] uppercase mt-1">Hotel & Resort</div>
            </Link>
            <div className="divider-gold mt-6" />
            <h1 className="luxury-heading text-3xl text-[#F7F3EE] mt-6">Welcome Back</h1>
            <p className="text-[#F7F3EE]/40 text-sm mt-2 font-light tracking-wider">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required
                  className="input-luxury pl-11" />
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="input-luxury pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F7F3EE]/30 hover:text-[#C8A96A] transition-colors">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-[#0B1320]/30 border-t-[#0B1320] rounded-full" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-[#F7F3EE]/35 text-sm font-light">
              New to Groks Hotel?{' '}
              <Link to="/register" className="text-[#C8A96A] hover:text-[#D8C3A5] transition-colors tracking-wider">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}