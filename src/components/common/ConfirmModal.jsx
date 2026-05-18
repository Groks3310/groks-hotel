import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center px-4"
        style={{ background: 'rgba(11,19,32,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="glass-card p-8 max-w-md w-full text-center"
          style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(200,169,106,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
            danger
              ? 'bg-[rgba(217,108,108,0.1)] border border-[rgba(217,108,108,0.3)]'
              : 'bg-[rgba(200,169,106,0.1)] border border-[rgba(200,169,106,0.3)]'
          }`}>
            <span className={`text-2xl ${danger ? 'text-[#D96C6C]' : 'text-[#C8A96A]'}`}>
              {danger ? '!' : '?'}
            </span>
          </div>

          <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-3">{title}</h3>
          <p className="text-[#F7F3EE]/55 text-sm font-light leading-relaxed mb-8">{message}</p>

          <div className="flex gap-4">
            <button onClick={onCancel}
              className="btn-outline flex-1 text-sm">
              Cancel
            </button>
            <button onClick={onConfirm}
              className={`flex-1 text-sm py-3 px-6 rounded-sm font-light tracking-[0.15em] uppercase text-[0.75rem] transition-all duration-300 ${
                danger
                  ? 'bg-[#D96C6C] text-white hover:bg-[#c55c5c]'
                  : 'btn-gold'
              }`}>
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
