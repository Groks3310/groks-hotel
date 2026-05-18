import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }
})

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    // Simulate send
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Message sent. We will be in touch shortly.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/section5.jpg" alt="Contact" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/85 to-[#0B1320]" />
        </div>
        <div className="relative z-10 text-center">
          <motion.p {...fadeUp(0)} className="section-label mb-4">Get In Touch</motion.p>
          <div className="divider-gold" />
          <motion.h1 {...fadeUp(0.1)} className="luxury-heading text-6xl text-[#F7F3EE] mt-6">
            Contact <span className="italic text-[#C8A96A]">Us</span>
          </motion.h1>
          <motion.p {...fadeUp(0.2)} className="text-[#F7F3EE]/45 mt-4 font-light tracking-wider">
            Our concierge team is available 24 hours a day, 7 days a week
          </motion.p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto pb-24">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: FiMapPin, label: 'Address', value: '1 Victoria Island Boulevard\nLagos Island, Lagos, Nigeria', href: null },
              { icon: FiPhone, label: 'Telephone', value: '+234 816 758 0313', href: 'tel:+2348167580313' },
              { icon: FiMail, label: 'Email', value: 'reservations@grokshotel.com', href: 'mailto:reservations@grokshotel.com' },
            ].map(({ icon: Icon, label, value, href }, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="glass-card p-6 flex gap-5 hover:border-[rgba(200,169,106,0.3)] transition-all duration-400">
                <div className="w-11 h-11 rounded-xl bg-[rgba(200,169,106,0.1)] border border-[rgba(200,169,106,0.2)] flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#C8A96A]" />
                </div>
                <div>
                  <div className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/35 mb-1">{label}</div>
                  {href ? (
                    <a href={href} className="text-[#F7F3EE]/70 text-sm hover:text-[#C8A96A] transition-colors leading-relaxed">{value}</a>
                  ) : (
                    <p className="text-[#F7F3EE]/70 text-sm leading-relaxed whitespace-pre-line">{value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* WhatsApp */}
            <motion.a {...fadeUp(0.3)}
              href="https://wa.me/2348167580313?text=Hello%20Groks%20Hotel%2C%20I%20need%20assistance"
              target="_blank" rel="noreferrer"
              className="glass-card p-6 flex gap-5 items-center hover:border-[rgba(76,175,136,0.4)] transition-all duration-400 group cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-[rgba(76,175,136,0.1)] border border-[rgba(76,175,136,0.2)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(76,175,136,0.2)] transition-colors">
                <FaWhatsapp size={18} className="text-[#4CAF88]" />
              </div>
              <div>
                <div className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/35 mb-1">WhatsApp Support</div>
                <p className="text-[#4CAF88]/80 text-sm group-hover:text-[#4CAF88] transition-colors">Chat with us instantly</p>
              </div>
            </motion.a>

            {/* Map placeholder */}
            <motion.div {...fadeUp(0.4)} className="glass-card overflow-hidden rounded-2xl" style={{ height: '200px' }}>
              <img src="/section2.jpg"
                alt="Map" className="w-full h-full object-cover opacity-70" />
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-3">
            <div className="glass-card p-10">
              <h2 className="luxury-heading text-3xl text-[#F7F3EE] mb-2">Send a Message</h2>
              <p className="text-[#F7F3EE]/40 text-sm mb-8 font-light">We typically respond within 2 hours</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name" required className="input-luxury" />
                  </div>
                  <div>
                    <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com" required className="input-luxury" />
                  </div>
                </div>

                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Subject</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    required className="input-luxury">
                    <option value="">Select a subject</option>
                    <option>Reservation Enquiry</option>
                    <option>Room Information</option>
                    <option>Special Occasion</option>
                    <option>Complaint / Feedback</option>
                    <option>Corporate Enquiry</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Message</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="How can we assist you?" rows={6} required className="input-luxury resize-none" />
                </div>

                <button type="submit" disabled={sending}
                  className="btn-gold w-full flex items-center justify-center gap-3 text-sm">
                  <FiSend size={14} />
                  {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
