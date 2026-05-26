import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiLock, FiCamera } from 'react-icons/fi'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleAvatarChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('phone', form.phone)
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await authAPI.updateProfile(fd)
      updateUser(res.data.user)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile')
    } finally { setSaving(false) }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    setSaving(true)
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password')
    } finally { setSaving(false) }
  }

  // Merged Logic: Handle absolute URLs and local previews safely
  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview;
    if (!user?.avatar) return null;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `https://groks-hotel-backend.onrender.com${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`;
  };

  const AVATAR_SRC = getAvatarSrc();

  return (
    <div className="min-h-screen pt-20 pb-24">
      <section className="py-16 px-6 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-label mb-3">Account</motion.p>
        <div className="divider-gold" />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="luxury-heading text-5xl text-[#F7F3EE] mt-5">
          My <span className="italic text-[#C8A96A]">Profile</span>
        </motion.h1>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-[#C8A96A]/40 overflow-hidden bg-[rgba(200,169,106,0.1)] flex items-center justify-center">
              {AVATAR_SRC ? (
                <img 
                  src={AVATAR_SRC} 
                  alt={user?.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23C8A96A" style="width:32px; height:32px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                  }}
                />
              ) : (
                <FiUser size={32} className="text-[#C8A96A]/50" />
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#C8A96A] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#D8C3A5] transition-colors">
              <FiCamera size={12} className="text-[#0B1320]" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <div className="luxury-heading text-2xl text-[#F7F3EE]">{user?.name}</div>
            <div className="text-[#F7F3EE]/40 text-sm mt-1">{user?.email}</div>
            <div className="mt-2">
              <span className={`px-3 py-1 text-[0.55rem] tracking-widest uppercase rounded-full border ${
                user?.role === 'admin'
                  ? 'text-[#C8A96A] bg-[rgba(200,169,106,0.1)] border-[rgba(200,169,106,0.3)]'
                  : 'text-[#4CAF88] bg-[rgba(76,175,136,0.1)] border-[rgba(76,175,136,0.3)]'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'Guest Member'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass-card p-1.5 rounded-xl">
          {[['profile', 'Profile Info'], ['password', 'Change Password']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[0.6rem] tracking-[0.2em] uppercase rounded-lg transition-all duration-300 ${
                tab === t ? 'bg-[#C8A96A] text-[#0B1320] font-medium' : 'text-[#F7F3EE]/50 hover:text-[#C8A96A]'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Forms remain the same */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
            <form onSubmit={handleProfileSave} className="space-y-5">
              <div>
                <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-luxury pl-11" placeholder="Your full name" required />
                </div>
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                  <input type="email" value={user?.email} disabled className="input-luxury pl-11 opacity-40 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="input-luxury pl-11" placeholder="+234 800 000 0000" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-gold w-full">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        )}
        
        {tab === 'password' && (
           <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
             <form onSubmit={handlePasswordSave} className="space-y-5">
               {['currentPassword', 'newPassword', 'confirm'].map((field) => (
                 <div key={field}>
                   <label className="text-[0.6rem] tracking-[0.25em] uppercase text-[#F7F3EE]/50 block mb-2">
                     {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                   </label>
                   <div className="relative">
                     <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C8A96A]/50" size={15} />
                     <input type="password" value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                       className="input-luxury pl-11" placeholder="••••••••" required />
                   </div>
                 </div>
               ))}
               <button type="submit" disabled={saving} className="btn-gold w-full">
                 {saving ? 'Updating...' : 'Update Password'}
               </button>
             </form>
           </motion.div>
        )}
      </div>
    </div>
  )
}