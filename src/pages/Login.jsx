

import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Login() {
  const emailRef = useRef()
  const passwordRef = useRef()
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
      await login(emailRef.current.value, passwordRef.current.value)
      toast.success('Welcome back.')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="/room8.jpg" alt="bg" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-[#0B1320]/70" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="glass-card p-10">
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
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="input-luxury pl-11"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                <input
                  ref={passwordRef}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-luxury pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F7F3EE]/30 hover:text-[#C8A96A] transition-colors">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
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
      </div>
    </div>
  )
}
