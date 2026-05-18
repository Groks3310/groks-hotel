import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { roomsAPI } from '../utils/api'
import RoomCard from '../components/rooms/RoomCard'
import { FiSearch, FiFilter } from 'react-icons/fi'

const CATEGORIES = ['All', 'Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Family Room']

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [search, setSearch] = useState('')
  const [available, setAvailable] = useState('')

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category !== 'All') params.category = category
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (available) params.available = available
      const res = await roomsAPI.getAll(params)
      setRooms(res.data.rooms)
    } catch { setRooms([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRooms() }, [category, available])

  const filtered = rooms.filter(r =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/section4.jpg" alt="Rooms" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/80 to-[#0B1320]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="section-label mb-4">
            Accommodations
          </motion.p>
          <div className="divider-gold" />
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="luxury-heading text-6xl text-[#F7F3EE] mt-6">
            Rooms & <span className="italic text-[#C8A96A]">Suites</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
            className="text-[#F7F3EE]/50 mt-4 font-light tracking-wider">
            Each suite tells a story of timeless elegance
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 max-w-7xl mx-auto mb-10">
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={16} />
              <input
                type="text" placeholder="Search rooms..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input-luxury pl-11"
              />
            </div>

            {/* Price range */}
            <div className="flex gap-3 items-center w-full lg:w-auto">
              <input type="number" placeholder="Min ₦" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="input-luxury w-28 text-sm" />
              <span className="text-[#F7F3EE]/30">—</span>
              <input type="number" placeholder="Max ₦" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="input-luxury w-28 text-sm" />
              <button onClick={fetchRooms} className="btn-gold py-3 px-5 text-[0.65rem]">Apply</button>
            </div>

            {/* Availability */}
            <select value={available} onChange={e => setAvailable(e.target.value)}
              className="input-luxury w-full lg:w-48 text-sm">
              <option value="">All Status</option>
              <option value="true">Available</option>
              <option value="false">Occupied</option>
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 text-[0.65rem] tracking-[0.2em] uppercase rounded-sm transition-all duration-300 ${
                  category === cat
                    ? 'bg-[#C8A96A] text-[#0B1320] font-medium'
                    : 'border border-[rgba(200,169,106,0.25)] text-[#F7F3EE]/60 hover:border-[#C8A96A] hover:text-[#C8A96A]'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Room Grid */}
      <section className="px-6 max-w-7xl mx-auto pb-24">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card overflow-hidden rounded-2xl">
                <div className="h-64 shimmer" />
                <div className="p-6 space-y-3">
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-full" />
                  <div className="h-4 shimmer rounded w-2/3" />
                  <div className="h-10 shimmer rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="luxury-heading text-6xl text-[#C8A96A]/20 mb-4">∅</div>
            <h3 className="luxury-heading text-3xl text-[#F7F3EE]/50 mb-3">No Rooms Found</h3>
            <p className="text-[#F7F3EE]/30 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <p className="text-[#F7F3EE]/40 text-sm mb-8 tracking-wider">{filtered.length} room{filtered.length !== 1 ? 's' : ''} available</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((room, i) => <RoomCard key={room._id} room={room} index={i} />)}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
