import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#0d1b2a] to-[#0B1320]" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        <div className="luxury-heading text-[180px] md:text-[250px] font-light text-[#C8A96A]/8 leading-none select-none mb-0">
          404
        </div>
        <div className="-mt-16 relative z-10">
          <p className="section-label mb-4">Page Not Found</p>
          <div className="divider-gold" />
          <h1 className="luxury-heading text-5xl text-[#F7F3EE] mt-6 mb-4">
            Lost in <span className="italic text-[#C8A96A]">Elegance</span>
          </h1>
          <p className="text-[#F7F3EE]/40 font-light mb-10 max-w-md mx-auto">
            The page you seek has drifted away like morning mist. Allow us to guide you back.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="btn-gold">Return Home</Link>
            <Link to="/rooms" className="btn-outline">View Rooms</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}