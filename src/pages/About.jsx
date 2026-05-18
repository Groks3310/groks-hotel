import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, delay, ease: [0.4, 0, 0.2, 1] }
})

const TEAM = [
  { name: 'Emmanuel Adeyemi', role: 'General Manager', img: '/section1.jpg' },
  { name: 'Ngozi Okonkwo', role: 'Head of Hospitality', img: '/section4.jpg' },
  { name: 'Chukwuemeka Eze', role: 'Executive Chef', img: '/room1.jpg' },
  { name: 'Adaeze Nwosu', role: 'Spa Director', img: '/section2.jpg' },
]

export default function About() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/section2.jpg" alt="About" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/85 to-[#0B1320]" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.p {...fadeUp(0)} className="section-label mb-4">Our Story</motion.p>
          <div className="divider-gold" />
          <motion.h1 {...fadeUp(0.1)} className="luxury-heading text-6xl text-[#F7F3EE] mt-6">
            A Legacy of <span className="italic text-[#C8A96A]">Refined Living</span>
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="section-label mb-4">Founded in Excellence</p>
            <div className="divider-gold" style={{ margin: '0 0 24px 0' }} />
            <h2 className="luxury-heading text-4xl text-[#F7F3EE] mb-8">
              More Than a Hotel.<br />
              <span className="italic text-[#C8A96A]">A Way of Life.</span>
            </h2>
            <div className="space-y-4 text-[#F7F3EE]/55 font-light leading-relaxed">
              <p>Groks Hotel & Resort was founded with a singular vision: to create a sanctuary where every guest experiences the highest echelons of luxury, comfort, and personalised service.</p>
              <p>Established over 15 years ago in the heart of Lagos, we have consistently redefined the standard of hospitality in West Africa. Our philosophy is rooted in the belief that true luxury lies in thoughtful details, graceful service, and spaces that inspire awe.</p>
              <p>From our handcrafted interiors featuring locally sourced marble and custom furnishings, to our award-winning culinary program celebrating the finest of Nigerian and international cuisine — every element of Groks has been designed to exceed expectation.</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="relative">
            <img src="/hotelBuilding.jpg" alt="Hotel"
              className="w-full rounded-2xl" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }} />
            <div className="absolute -bottom-8 -right-8 glass-card p-6 text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div className="luxury-heading text-4xl text-[#C8A96A]">2009</div>
              <div className="text-[0.6rem] tracking-[0.3em] uppercase text-[#F7F3EE]/40 mt-1">Founded</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-[#0d1b2a]">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="section-label mb-4">Our Principles</p>
            <div className="divider-gold" />
            <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6">
              The <span className="italic text-[#C8A96A]">Groks Standard</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '✦', title: 'Impeccable Service', desc: 'Every interaction is an opportunity to exceed expectation. Our staff are trained to anticipate needs before they arise.' },
              { icon: '◈', title: 'Timeless Elegance', desc: 'We believe beauty endures. Our design philosophy blends contemporary luxury with elements of timeless African artistry.' },
              { icon: '❖', title: 'Genuine Warmth', desc: 'Beneath the grandeur lives a genuine Nigerian warmth. You are not just a guest — you are family.' },
            ].map((v, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="glass-card p-8 text-center hover:border-[rgba(200,169,106,0.35)] transition-all duration-500 group">
                <div className="text-[#C8A96A] text-3xl mb-5 group-hover:scale-110 transition-transform duration-300">{v.icon}</div>
                <h3 className="luxury-heading text-2xl text-[#F7F3EE] mb-3">{v.title}</h3>
                <p className="text-[#F7F3EE]/45 text-sm font-light leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-[rgba(200,169,106,0.1)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['15+', 'Years'], ['200+', 'Rooms'], ['50K+', 'Guests'], ['12', 'Awards']].map(([num, label]) => (
            <motion.div key={label} {...fadeUp(0)}>
              <div className="luxury-heading text-5xl text-[#C8A96A] mb-2">{num}</div>
              <div className="text-[0.6rem] tracking-[0.3em] uppercase text-[#F7F3EE]/35">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <p className="section-label mb-4">The People Behind the Magic</p>
          <div className="divider-gold" />
          <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6">
            Our <span className="italic text-[#C8A96A]">Leadership</span>
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center group">
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <img src={member.img} alt={member.name} className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320]/60 to-transparent" />
              </div>
              <h3 className="luxury-heading text-xl text-[#F7F3EE] group-hover:text-[#C8A96A] transition-colors duration-300">{member.name}</h3>
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/40 mt-1">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div {...fadeUp(0)}>
          <p className="section-label mb-4">Experience It Yourself</p>
          <div className="divider-gold" />
          <h2 className="luxury-heading text-5xl text-[#F7F3EE] mt-6 mb-4">
            Your Story <span className="italic text-[#C8A96A]">Starts Here</span>
          </h2>
          <p className="text-[#F7F3EE]/45 mb-10 font-light max-w-xl mx-auto">Let us craft an unforgettable chapter in the story of your life.</p>
          <Link to="/rooms" className="btn-gold">Book Your Suite</Link>
        </motion.div>
      </section>
    </div>
  )
}
