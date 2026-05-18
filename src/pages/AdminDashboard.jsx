import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminAPI, bookingsAPI, roomsAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiUsers, FiHome, FiDollarSign, FiCalendar, FiCheck, FiX, FiEdit, FiTrash2, FiBell, FiPlus, FiSave, FiImage } from 'react-icons/fi'
import { io } from 'socket.io-client'
import ConfirmModal from '../components/common/ConfirmModal'

const TABS = ['Overview', 'Bookings', 'Rooms', 'Users']
const CATEGORIES = ['Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Family Room']
const ALL_IMAGES = [
  '/hotelHero.jpg', '/section1.jpg', '/section2.jpg', '/section3.jpg', '/section4.jpg',
  '/room1.jpg', '/room2.jpg', '/room3.jpg', '/room4.jpg', '/room5.jpg',
  '/room6.jpg', '/room7.jpg', '/room8.jpg', '/dinner.jpg', '/pavilon.jpg',
  '/pavilon1.jpg', '/hotelBuilding.jpg', '/Allrooms.jpg',
]

const EMPTY_ROOM = {
  title: '', category: 'Deluxe Room', roomNumber: '', floor: 1, size: 0,
  price: '', description: '', amenities: '', isAvailable: true, featured: false,
  capacity: { adults: 2, children: 0 }, images: [],
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  // Room editor state
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM)
  const [savingRoom, setSavingRoom] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null })

  useEffect(() => {
    loadData()
    const socket = io(window.location.origin.replace('5173', '5000'), { withCredentials: true })
    socket.emit('joinAdmin')
    socket.on('newBooking', (data) => {
      setNotifications(prev => [{ ...data, time: new Date() }, ...prev.slice(0, 9)])
      toast.success(`New booking: ${data.bookingCode}`)
      loadData()
    })
    socket.on('bookingStatusUpdate', () => loadData())
    return () => socket.disconnect()
  }, [])

  const loadData = async () => {
    try {
      const [sRes, bRes, rRes, uRes] = await Promise.all([
        adminAPI.getStats(), bookingsAPI.getAll(), roomsAPI.getAll(), adminAPI.getUsers(),
      ])
      setStats(sRes.data.stats)
      setBookings(bRes.data.bookings)
      setRooms(rRes.data.rooms)
      setUsers(uRes.data.users)
    } catch { toast.error('Could not load data') }
    finally { setLoading(false) }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: status } : b))
      toast.success(`Booking ${status}`)
    } catch { toast.error('Update failed') }
  }

  // ── Room CRUD ──
  const openNewRoom = () => {
    setEditingRoom(null)
    setRoomForm(EMPTY_ROOM)
    setShowRoomForm(true)
  }

  const openEditRoom = (room) => {
    setEditingRoom(room)
    setRoomForm({
      title: room.title,
      category: room.category,
      roomNumber: room.roomNumber,
      floor: room.floor,
      size: room.size,
      price: room.price,
      description: room.description,
      amenities: room.amenities?.join(', ') || '',
      isAvailable: room.isAvailable,
      featured: room.featured,
      capacity: room.capacity || { adults: 2, children: 0 },
      images: room.images || [],
    })
    setShowRoomForm(true)
  }

  const saveRoom = async () => {
    if (!roomForm.title || !roomForm.price || !roomForm.roomNumber) {
      return toast.error('Title, room number and price are required')
    }
    setSavingRoom(true)
    try {
      const payload = {
        ...roomForm,
        amenities: roomForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
        price: Number(roomForm.price),
        floor: Number(roomForm.floor),
        size: Number(roomForm.size),
      }
      if (editingRoom) {
        await roomsAPI.update(editingRoom._id, payload)
        toast.success('Room updated!')
      } else {
        await roomsAPI.create(JSON.stringify(payload))
        toast.success('Room created!')
      }
      setShowRoomForm(false)
      setEditingRoom(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save room')
    } finally { setSavingRoom(false) }
  }

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room permanently?')) return
    try {
      await roomsAPI.delete(id)
      setRooms(prev => prev.filter(r => r._id !== id))
      toast.success('Room deleted')
    } catch { toast.error('Delete failed') }
  }

  const toggleAvailability = async (id, current) => {
    try {
      await roomsAPI.update(id, { isAvailable: !current })
      setRooms(prev => prev.map(r => r._id === id ? { ...r, isAvailable: !current } : r))
      toast.success(`Room marked as ${!current ? 'Available' : 'Occupied'}`)
    } catch { toast.error('Update failed') }
  }

  const deleteBooking = async (id) => {
    setConfirmModal({ open: true, title: 'Delete Booking', message: 'Are you sure you want to permanently delete this reservation? This cannot be undone.', onConfirm: async () => {
      setConfirmModal(p => ({ ...p, open: false }))
      try {
        await bookingsAPI.deleteBooking(id)
        setStats(p => p ? { ...p, recentBookings: p.recentBookings.filter(b => b._id !== id) } : p)
        setBookings(prev => prev.filter(b => b._id !== id))
        toast.success('Booking deleted')
      } catch { toast.error('Could not delete booking') }
    }})
  }

  const addImage = (url) => {
    if (roomForm.images.find(i => i.url === url)) return
    setRoomForm(p => ({ ...p, images: [...p.images, { url, alt: roomForm.title }] }))
    setShowImagePicker(false)
  }

  const removeImage = (url) => {
    setRoomForm(p => ({ ...p, images: p.images.filter(i => i.url !== url) }))
  }

  const STAT_CARDS = stats ? [
    { icon: FiCalendar, label: 'Total Bookings', value: stats.totalBookings, color: '#C8A96A' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₦${stats.totalRevenue?.toLocaleString()}`, color: '#4CAF88' },
    { icon: FiUsers, label: 'Registered Users', value: stats.totalUsers, color: '#A58E6F' },
    { icon: FiHome, label: 'Total Rooms', value: stats.totalRooms, color: '#D8C3A5' },
  ] : []

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="luxury-heading text-4xl text-[#C8A96A]/30 animate-pulse">Loading Dashboard...</div>
    </div>
  )

  return (
    <div className="min-h-screen pt-20 pb-24">
      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        danger={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, open: false }))}
      />
      {/* Header */}
      <div className="px-6 max-w-7xl mx-auto py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label mb-2">Administration</p>
            <h1 className="luxury-heading text-4xl text-[#F7F3EE]">
              Dashboard <span className="italic text-[#C8A96A]">Overview</span>
            </h1>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 glass-card px-4 py-2">
              <FiBell size={14} className="text-[#C8A96A]" />
              <span className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/60">{notifications.length} new alert{notifications.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="px-6 max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card p-6 hover:border-[rgba(200,169,106,0.3)] transition-all duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="luxury-heading text-3xl mb-1" style={{ color }}>{value}</div>
              <div className="text-[0.6rem] tracking-[0.2em] uppercase text-[#F7F3EE]/40">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 max-w-7xl mx-auto mb-8">
        <div className="flex gap-1 glass-card p-1.5 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-[0.6rem] tracking-[0.2em] uppercase rounded-lg transition-all duration-300 ${
                tab === t ? 'bg-[#C8A96A] text-[#0B1320] font-medium' : 'text-[#F7F3EE]/50 hover:text-[#C8A96A]'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div>
            <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-5">Recent Reservations</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Code', 'Guest', 'Room', 'Check-in', 'Total', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-[0.55rem] tracking-[0.25em] uppercase text-[#F7F3EE]/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentBookings || []).map(b => (
                      <tr key={b._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4 text-[#C8A96A] text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-5 py-4 text-[#F7F3EE]/70 text-sm">{b.user?.name}</td>
                        <td className="px-5 py-4 text-[#F7F3EE]/60 text-xs">{b.room?.title}</td>
                        <td className="px-5 py-4 text-[#F7F3EE]/50 text-xs">{new Date(b.checkIn).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-[#C8A96A] text-sm">₦{b.totalPrice?.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-[0.55rem] tracking-wider uppercase rounded-full border ${
                            b.bookingStatus === 'confirmed' ? 'text-[#4CAF88] border-[rgba(76,175,136,0.3)] bg-[rgba(76,175,136,0.1)]' :
                            b.bookingStatus === 'pending' ? 'text-[#C8A96A] border-[rgba(200,169,106,0.3)] bg-[rgba(200,169,106,0.1)]' :
                            'text-[#D96C6C] border-[rgba(217,108,108,0.3)] bg-[rgba(217,108,108,0.1)]'
                          }`}>{b.bookingStatus}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            {b.bookingStatus === 'pending' && (
                              <button onClick={() => updateBookingStatus(b._id, 'confirmed')}
                                title="Confirm booking"
                                className="p-1.5 text-[#4CAF88] hover:bg-[rgba(76,175,136,0.1)] rounded transition-colors">
                                <FiCheck size={13} />
                              </button>
                            )}
                            {b.bookingStatus !== 'cancelled' && (
                              <button onClick={() => updateBookingStatus(b._id, 'cancelled')}
                                title="Cancel booking"
                                className="p-1.5 text-[#D96C6C] hover:bg-[rgba(217,108,108,0.1)] rounded transition-colors">
                                <FiX size={13} />
                              </button>
                            )}
                            <button onClick={() => deleteBooking(b._id)}
                              title="Delete booking"
                              className="p-1.5 text-[#D96C6C]/50 hover:text-[#D96C6C] hover:bg-[rgba(217,108,108,0.1)] rounded transition-colors">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'Bookings' && (
          <div>
            <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-5">All Bookings ({bookings.length})</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Code', 'Guest', 'Room', 'Dates', 'Nights', 'Total', 'Payment', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-4 text-[0.55rem] tracking-[0.2em] uppercase text-[#F7F3EE]/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-[#C8A96A] text-xs tracking-wider">{b.bookingCode}</td>
                        <td className="px-4 py-3">
                          <div className="text-[#F7F3EE]/80 text-xs">{b.user?.name}</div>
                          <div className="text-[#F7F3EE]/35 text-[0.6rem]">{b.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-[#F7F3EE]/60 text-xs">{b.room?.title}</td>
                        <td className="px-4 py-3 text-[#F7F3EE]/50 text-xs">
                          <div>{new Date(b.checkIn).toLocaleDateString()}</div>
                          <div>→ {new Date(b.checkOut).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-3 text-[#F7F3EE]/60 text-xs">{b.nights}</td>
                        <td className="px-4 py-3 text-[#C8A96A] text-sm">₦{b.totalPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[0.55rem] tracking-wider uppercase ${b.paymentStatus === 'paid' ? 'text-[#4CAF88]' : b.paymentStatus === 'failed' ? 'text-[#D96C6C]' : 'text-[#C8A96A]'}`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select value={b.bookingStatus}
                            onChange={e => updateBookingStatus(b._id, e.target.value)}
                            className="bg-transparent text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/60 border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-[#C8A96A]">
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ROOMS ── */}
        {tab === 'Rooms' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="luxury-heading text-2xl text-[#F7F3EE]">Room Management ({rooms.length})</h2>
              <button onClick={openNewRoom} className="btn-gold flex items-center gap-2 text-[0.65rem]">
                <FiPlus size={13} /> Add New Room
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rooms.map(room => (
                <div key={room._id} className="glass-card overflow-hidden hover:border-[rgba(200,169,106,0.3)] transition-all duration-300 group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={room.images?.[0]?.url || '/section4.jpg'}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={e => { e.target.src = '/section4.jpg' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/80 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 text-[0.55rem] tracking-wider uppercase rounded-full border ${
                        room.isAvailable
                          ? 'text-[#4CAF88] border-[rgba(76,175,136,0.4)] bg-[rgba(76,175,136,0.1)]'
                          : 'text-[#D96C6C] border-[rgba(217,108,108,0.4)] bg-[rgba(217,108,108,0.1)]'
                      }`}>
                        {room.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                    {room.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 text-[0.55rem] tracking-wider uppercase rounded-full text-[#C8A96A] border border-[rgba(200,169,106,0.4)] bg-[rgba(200,169,106,0.1)]">
                          Featured
                        </span>
                      </div>
                    )}
                    {/* Image count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[#F7F3EE]/60 text-xs">
                      <FiImage size={11} /> {room.images?.length || 0}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="luxury-heading text-lg text-[#F7F3EE] mb-1">{room.title}</h3>
                    <p className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/35 mb-3">{room.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#C8A96A]">₦{room.price?.toLocaleString()}<span className="text-xs text-[#F7F3EE]/30">/night</span></span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleAvailability(room._id, room.isAvailable)}
                          title="Toggle availability"
                          className={`p-1.5 rounded transition-colors text-xs px-2 border ${
                            room.isAvailable
                              ? 'text-[#D96C6C]/60 hover:text-[#D96C6C] border-[rgba(217,108,108,0.2)]'
                              : 'text-[#4CAF88]/60 hover:text-[#4CAF88] border-[rgba(76,175,136,0.2)]'
                          }`}>
                          {room.isAvailable ? 'Set Occupied' : 'Set Available'}
                        </button>
                        <button onClick={() => openEditRoom(room)}
                          className="p-1.5 text-[#C8A96A]/60 hover:text-[#C8A96A] hover:bg-[rgba(200,169,106,0.1)] rounded transition-colors">
                          <FiEdit size={13} />
                        </button>
                        <button onClick={() => deleteRoom(room._id)}
                          className="p-1.5 text-[#D96C6C]/60 hover:text-[#D96C6C] hover:bg-[rgba(217,108,108,0.1)] rounded transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'Users' && (
          <div>
            <h2 className="luxury-heading text-2xl text-[#F7F3EE] mb-5">User Management ({users.length})</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-[0.55rem] tracking-[0.25em] uppercase text-[#F7F3EE]/35">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4 text-[#F7F3EE]/80 text-sm">{u.name}</td>
                        <td className="px-5 py-4 text-[#F7F3EE]/50 text-xs">{u.email}</td>
                        <td className="px-5 py-4 text-[#F7F3EE]/40 text-xs">{u.phone || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-[0.55rem] tracking-wider uppercase rounded-full border ${
                            u.role === 'admin'
                              ? 'text-[#C8A96A] border-[rgba(200,169,106,0.3)] bg-[rgba(200,169,106,0.1)]'
                              : 'text-[#4CAF88] border-[rgba(76,175,136,0.3)] bg-[rgba(76,175,136,0.1)]'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-5 py-4 text-[#F7F3EE]/35 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => adminAPI.deleteUser(u._id).then(() => { setUsers(p => p.filter(x => x._id !== u._id)); toast.success('User removed') }).catch(() => toast.error('Failed'))}
                            className="p-1.5 text-[#D96C6C]/50 hover:text-[#D96C6C] transition-colors">
                            <FiTrash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ROOM FORM MODAL ── */}
      <AnimatePresence>
        {showRoomForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-[#0B1320]/90 backdrop-blur-sm overflow-y-auto py-10 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowRoomForm(false) }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-3xl glass-card p-8"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="section-label mb-1">{editingRoom ? 'Edit Room' : 'New Room'}</p>
                  <h2 className="luxury-heading text-3xl text-[#F7F3EE]">
                    {editingRoom ? editingRoom.title : 'Add Room'}
                  </h2>
                </div>
                <button onClick={() => setShowRoomForm(false)} className="text-[#F7F3EE]/30 hover:text-[#C8A96A] transition-colors">
                  <FiX size={22} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Room Title *</label>
                  <input type="text" value={roomForm.title} onChange={e => setRoomForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Ocean View Deluxe" className="input-luxury" />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Category *</label>
                  <select value={roomForm.category} onChange={e => setRoomForm(p => ({ ...p, category: e.target.value }))} className="input-luxury">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Room Number */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Room Number *</label>
                  <input type="text" value={roomForm.roomNumber} onChange={e => setRoomForm(p => ({ ...p, roomNumber: e.target.value }))}
                    placeholder="e.g. DR-104" className="input-luxury" />
                </div>

                {/* Price */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Price per Night (₦) *</label>
                  <input type="number" value={roomForm.price} onChange={e => setRoomForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 85000" className="input-luxury" />
                </div>

                {/* Floor */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Floor</label>
                  <input type="number" value={roomForm.floor} onChange={e => setRoomForm(p => ({ ...p, floor: e.target.value }))}
                    className="input-luxury" />
                </div>

                {/* Size */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Size (m²)</label>
                  <input type="number" value={roomForm.size} onChange={e => setRoomForm(p => ({ ...p, size: e.target.value }))}
                    className="input-luxury" />
                </div>

                {/* Adults */}
                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Max Adults</label>
                  <input type="number" value={roomForm.capacity.adults} min={1} max={10}
                    onChange={e => setRoomForm(p => ({ ...p, capacity: { ...p.capacity, adults: Number(e.target.value) } }))}
                    className="input-luxury" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Description</label>
                  <textarea value={roomForm.description} onChange={e => setRoomForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the room..." rows={3} className="input-luxury resize-none" />
                </div>

                {/* Amenities */}
                <div className="md:col-span-2">
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Amenities (comma separated)</label>
                  <input type="text" value={roomForm.amenities} onChange={e => setRoomForm(p => ({ ...p, amenities: e.target.value }))}
                    placeholder="King Bed, Free WiFi, Mini Bar, Air Conditioning..." className="input-luxury" />
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setRoomForm(p => ({ ...p, isAvailable: !p.isAvailable }))}
                      className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${roomForm.isAvailable ? 'bg-[#4CAF88]' : 'bg-white/20'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${roomForm.isAvailable ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[0.65rem] tracking-wider uppercase text-[#F7F3EE]/60">Available</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setRoomForm(p => ({ ...p, featured: !p.featured }))}
                      className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${roomForm.featured ? 'bg-[#C8A96A]' : 'bg-white/20'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${roomForm.featured ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-[0.65rem] tracking-wider uppercase text-[#F7F3EE]/60">Featured</span>
                  </label>
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50">Room Images</label>
                    <button type="button" onClick={() => setShowImagePicker(!showImagePicker)}
                      className="btn-outline text-[0.6rem] py-1.5 px-4 flex items-center gap-2">
                      <FiImage size={12} /> Add Image
                    </button>
                  </div>

                  {/* Selected images */}
                  {roomForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {roomForm.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img.url} alt={img.alt}
                            className="w-20 h-20 object-cover rounded-xl border border-white/10"
                            onError={e => { e.target.src = '/section4.jpg' }} />
                          <button onClick={() => removeImage(img.url)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-[#D96C6C] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiX size={10} className="text-white" />
                          </button>
                          {i === 0 && <div className="absolute bottom-1 left-1 text-[0.5rem] bg-[#C8A96A] text-[#0B1320] px-1 rounded">Main</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image picker */}
                  {showImagePicker && (
                    <div className="glass-card p-4 rounded-xl">
                      <p className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/40 mb-3">Select an image</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {ALL_IMAGES.map((src, i) => (
                          <button key={i} onClick={() => addImage(src)}
                            className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                              roomForm.images.find(img => img.url === src)
                                ? 'border-[#C8A96A] opacity-50 cursor-not-allowed'
                                : 'border-transparent hover:border-[#C8A96A]'
                            }`}>
                            <img src={src} alt={src}
                              className="w-full h-14 object-cover"
                              onError={e => { e.target.style.display = 'none' }} />
                            <div className="absolute inset-0 hover:bg-[#C8A96A]/10 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <button onClick={() => setShowRoomForm(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={saveRoom} disabled={savingRoom} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <FiSave size={14} />
                  {savingRoom ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
