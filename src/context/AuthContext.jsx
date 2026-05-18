import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) fetchMe(token)
    else setLoading(false)
  }, [])

  const fetchMe = async (token) => {
    try {
      const res = await authAPI.getMe()
      setUser(res.data.user)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password, phone) => {
    const res = await authAPI.register({ name, email, password, phone })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await authAPI.logout()
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (updatedUser) => setUser(updatedUser)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}