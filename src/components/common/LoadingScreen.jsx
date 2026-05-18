import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#0B1320] flex flex-col items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="font-serif text-5xl font-light tracking-[0.2em] text-[#F7F3EE] mb-2">GROKS</div>
        <div className="text-[0.55rem] tracking-[0.5em] text-[#C8A96A] uppercase mb-12">Hotel & Resort</div>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#C8A96A]"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}