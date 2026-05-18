import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiMaximize2, FiStar } from 'react-icons/fi'

const PLACEHOLDER = '/section4.jpg'

export default function RoomCard({ room, index = 0 }) {
  const img = room.images?.[0]?.url || PLACEHOLDER

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="group relative overflow-hidden rounded-2xl glass-card hover:border-[rgba(200,169,106,0.4)] transition-all duration-500"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={img}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        {/* Strong multi-layer overlay so text always shows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/95 via-[#0B1320]/30 to-[#0B1320]/20" />
        {/* Extra top overlay so badges are always readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/50 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-[#0B1320]/70 backdrop-blur-md border border-[rgba(200,169,106,0.4)] rounded-full">
          <span className="text-[0.6rem] tracking-[0.25em] uppercase text-[#C8A96A]">{room.category}</span>
        </div>

        {/* Availability */}
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-[0.6rem] tracking-wider uppercase font-medium backdrop-blur-md ${
          room.isAvailable
            ? 'bg-[#0B1320]/70 text-[#4CAF88] border border-[rgba(76,175,136,0.5)]'
            : 'bg-[#0B1320]/70 text-[#D96C6C] border border-[rgba(217,108,108,0.5)]'
        }`}>
          {room.isAvailable ? 'Available' : 'Occupied'}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="luxury-heading text-xl text-[#F7F3EE] group-hover:text-[#C8A96A] transition-colors duration-300">{room.title}</h3>
          {room.rating?.count > 0 && (
            <div className="flex items-center gap-1 text-[#C8A96A]">
              <FiStar size={12} className="fill-current" />
              <span className="text-xs">{room.rating.average}</span>
            </div>
          )}
        </div>

        <p className="text-[#F7F3EE]/50 text-sm font-light leading-relaxed mb-5 line-clamp-2">{room.description}</p>

        <div className="flex items-center gap-5 mb-5 text-[#F7F3EE]/40 text-xs">
          <span className="flex items-center gap-1.5">
            <FiUsers size={12} /> {room.capacity?.adults} guests
          </span>
          {room.size > 0 && (
            <span className="flex items-center gap-1.5">
              <FiMaximize2 size={12} /> {room.size} m²
            </span>
          )}
        </div>

        {/* Amenities preview */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {room.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="px-2 py-0.5 text-[0.6rem] tracking-wider uppercase bg-white/5 text-[#F7F3EE]/50 rounded-sm">{a}</span>
            ))}
            {room.amenities.length > 3 && (
              <span className="px-2 py-0.5 text-[0.6rem] tracking-wider uppercase bg-white/5 text-[#C8A96A]/60 rounded-sm">+{room.amenities.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <span className="text-[0.6rem] tracking-wider uppercase text-[#F7F3EE]/40">From</span>
            <div className="text-[#C8A96A] font-light">
              <span className="text-xl">₦{room.price?.toLocaleString()}</span>
              <span className="text-xs text-[#F7F3EE]/40 ml-1">/ night</span>
            </div>
          </div>
          <Link
            to={`/rooms/${room._id}`}
            className="btn-gold text-[0.65rem] py-2.5 px-5"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
