import { Link } from 'react-router-dom'
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-[#080e1a] border-t border-[rgba(200,169,106,0.12)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <div className="font-serif text-3xl font-light tracking-[0.15em] text-[#F7F3EE]">GROKS</div>
              <div className="text-[0.55rem] tracking-[0.4em] text-[#C8A96A] uppercase mt-1">Hotel & Resort</div>
            </div>
            <p className="text-[#F7F3EE]/50 text-sm font-light leading-relaxed mb-6">
              Where every moment is crafted with intention. Experience the pinnacle of luxury hospitality.
            </p>
            <div className="flex gap-4">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-[rgba(200,169,106,0.25)] rounded-full flex items-center justify-center text-[#C8A96A]/60 hover:text-[#C8A96A] hover:border-[#C8A96A] transition-all duration-300">
                  <Icon size={14} />
                </a>
              ))}
              <a href="https://wa.me/2348167580313" target="_blank" rel="noreferrer" className="w-9 h-9 border border-[rgba(200,169,106,0.25)] rounded-full flex items-center justify-center text-[#C8A96A]/60 hover:text-[#4CAF88] hover:border-[#4CAF88] transition-all duration-300">
                <FaWhatsapp size={14} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="section-label mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[['/', 'Home'], ['/rooms', 'Rooms & Suites'], ['/about', 'Our Story'], ['/contact', 'Contact Us']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-[#F7F3EE]/50 text-sm hover:text-[#C8A96A] transition-colors duration-300">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Room Categories */}
          <div>
            <h4 className="section-label mb-6">Our Rooms</h4>
            <ul className="space-y-3">
              {['Deluxe Room', 'Executive Suite', 'Presidential Suite', 'Family Room'].map((r) => (
                <li key={r}>
                  <Link to={`/rooms?category=${encodeURIComponent(r)}`} className="text-[#F7F3EE]/50 text-sm hover:text-[#C8A96A] transition-colors duration-300">{r}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[#F7F3EE]/50 text-sm">
                <FiMapPin size={14} className="text-[#C8A96A] mt-0.5 shrink-0" />
                <span>1 Victoria Island Boulevard, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-[#F7F3EE]/50 text-sm">
                <FiPhone size={14} className="text-[#C8A96A] shrink-0" />
                <a href="tel:+2348167580313" className="hover:text-[#C8A96A] transition-colors">+234 816 758 0313</a>
              </li>
              <li className="flex items-center gap-3 text-[#F7F3EE]/50 text-sm">
                <FiMail size={14} className="text-[#C8A96A] shrink-0" />
                <a href="mailto:reservations@grokshotel.com" className="hover:text-[#C8A96A] transition-colors">reservations@grokshotel.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(200,169,106,0.1)] mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#F7F3EE]/30 text-xs tracking-wider">© {new Date().getFullYear()} Groks Hotel & Resort. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[#F7F3EE]/30 text-xs hover:text-[#C8A96A] transition-colors tracking-wider">Privacy Policy</a>
            <a href="#" className="text-[#F7F3EE]/30 text-xs hover:text-[#C8A96A] transition-colors tracking-wider">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}