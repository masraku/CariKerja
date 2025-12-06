'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, Target, Eye, Users, Briefcase, TrendingUp, Award, CheckCircle, Heart, Globe, Zap, Building2, UserCheck, FileCheck, Star, ArrowRight, Mail, Phone, MapPin } from 'lucide-react'

const AboutPage = () => {
  const [activeYear, setActiveYear] = useState(2024)

  const stats = [
    { icon: Users, value: '100K+', label: 'Pencari Kerja', color: '#3b82f6' },
    { icon: Building2, value: '5K+', label: 'Perusahaan', color: '#10b981' },
    { icon: Briefcase, value: '50K+', label: 'Lowongan', color: '#8b5cf6' },
    { icon: UserCheck, value: '75K+', label: 'Diterima Kerja', color: '#f59e0b' }
  ]

  const features = [
    { icon: Shield, title: 'Platform Resmi Pemerintah', desc: 'Dikelola langsung oleh Disnaker dan Kominfo', color: '#3b82f6' },
    { icon: FileCheck, title: 'Verifikasi Perusahaan', desc: 'Semua perusahaan diverifikasi legalitasnya', color: '#10b981' },
    { icon: Globe, title: 'Akses Gratis', desc: '100% gratis untuk pencari kerja', color: '#8b5cf6' },
    { icon: Zap, title: 'Proses Cepat', desc: 'Sistem matching otomatis yang akurat', color: '#f59e0b' },
    { icon: Award, title: 'Standar Profesional', desc: 'Menjunjung tinggi profesionalitas', color: '#ec4899' },
    { icon: Heart, title: 'Dukungan 24/7', desc: 'Tim support siap membantu kapan saja', color: '#6366f1' }
  ]

  const timeline = [
    { year: 2021, title: 'Inisiasi Program', achievements: ['Studi kelayakan platform', 'Pembentukan tim', 'Riset kebutuhan pasar'] },
    { year: 2022, title: 'Pengembangan', achievements: ['Development sistem', 'Testing 100 perusahaan pilot', 'Peluncuran beta'] },
    { year: 2023, title: 'Peluncuran Resmi', achievements: ['10K+ pengguna dalam 3 bulan', '500+ perusahaan terverifikasi', 'Ekspansi 20 kota'] },
    { year: 2024, title: 'Ekspansi & Inovasi', achievements: ['100K+ pengguna aktif', 'AI-powered matching', 'Partnership 50+ universitas'] }
  ]

  const testimonials = [
    { name: 'Rina Kusuma', role: 'Frontend Developer', company: 'Tech Startup', text: 'Platform ini sangat membantu saya menemukan pekerjaan impian.' },
    { name: 'Ahmad Fauzi', role: 'HR Manager', company: 'Manufacturing', text: 'Sistem matching yang akurat membantu kami menemukan kandidat berkualitas.' },
    { name: 'Siti Nurhaliza', role: 'Fresh Graduate', company: 'Marketing Agency', text: 'Sebagai fresh graduate, platform ini sangat membantu. Recommended!' }
  ]

  // Styles
  const containerStyle = { minHeight: '100vh', background: '#f8fafc' }
  const sectionStyle = { padding: 'clamp(40px, 8%, 80px) 5%' }
  const maxWidthStyle = { maxWidth: '1200px', margin: '0 auto' }
  const headingStyle = { fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 700, color: '#111827', textAlign: 'center', marginBottom: '16px' }
  const subheadingStyle = { color: '#6b7280', textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px', fontSize: 'clamp(14px, 2vw, 16px)' }
  const cardStyle = { background: 'white', borderRadius: '20px', padding: 'clamp(24px, 4%, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }
  const buttonPrimary = {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '14px',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  }

  return (
    <div style={containerStyle}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)', padding: 'clamp(60px, 10%, 100px) 5%', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ ...maxWidthStyle, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.15)', padding: '12px 24px', borderRadius: '100px', marginBottom: '24px' }}>
            <span style={{ fontSize: '24px' }}>🇮🇩</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Platform Resmi Pemerintah</div>
              <div style={{ fontWeight: 600 }}>Disnaker & Kominfo RI</div>
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>
            Membangun Masa Depan<br />
            <span style={{ opacity: 0.9 }}>Ketenagakerjaan Indonesia</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            Platform digital terpercaya yang menghubungkan talenta terbaik Indonesia dengan perusahaan berkualitas
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', maxWidth: '700px', margin: '0 auto' }}>
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: stat.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={24} color="white" />
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div style={{ ...sectionStyle, background: 'white' }}>
        <div style={maxWidthStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ ...cardStyle, borderTop: '4px solid #3b82f6' }}>
              <div style={{ width: '56px', height: '56px', background: '#dbeafe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Eye size={28} color="#3b82f6" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Visi Kami</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>
                Menjadi platform ketenagakerjaan digital nomor satu di Indonesia yang terpercaya, transparan, dan inklusif.
              </p>
            </div>
            <div style={{ ...cardStyle, borderTop: '4px solid #10b981' }}>
              <div style={{ width: '56px', height: '56px', background: '#d1fae5', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Target size={28} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>Misi Kami</h2>
              <ul style={{ color: '#4b5563', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>Menyediakan akses kerja yang mudah dan merata</li>
                <li>Memastikan keamanan dan transparansi</li>
                <li>Meningkatkan kualitas SDM Indonesia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ ...sectionStyle, background: '#f8fafc' }}>
        <div style={maxWidthStyle}>
          <p style={{ color: '#4f46e5', fontWeight: 600, textAlign: 'center', fontSize: '14px', marginBottom: '8px' }}>KEUNGGULAN PLATFORM</p>
          <h2 style={headingStyle}>Mengapa Memilih Kami?</h2>
          <p style={subheadingStyle}>Platform dengan standar pemerintah untuk keamanan dan kredibilitas maksimal</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} style={{ ...cardStyle, textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: `${f.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Icon size={32} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ ...sectionStyle, background: 'white' }}>
        <div style={maxWidthStyle}>
          <p style={{ color: '#8b5cf6', fontWeight: 600, textAlign: 'center', fontSize: '14px', marginBottom: '8px' }}>PERJALANAN KAMI</p>
          <h2 style={headingStyle}>Milestone & Pencapaian</h2>
          <p style={subheadingStyle}>Dari ide hingga menjadi platform ketenagakerjaan terbesar di Indonesia</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
            {timeline.map(item => (
              <button
                key={item.year}
                onClick={() => setActiveYear(item.year)}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  cursor: 'pointer',
                  background: activeYear === item.year ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : '#f3f4f6',
                  color: activeYear === item.year ? 'white' : '#6b7280',
                  boxShadow: activeYear === item.year ? '0 8px 24px rgba(139,92,246,0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.year}
              </button>
            ))}
          </div>

          {timeline.filter(t => t.year === activeYear).map(item => (
            <div key={item.year} style={{ ...cardStyle, maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
                  {item.year}
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                </div>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {item.achievements.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#faf5ff', borderRadius: '12px' }}>
                    <CheckCircle size={20} color="#8b5cf6" />
                    <span style={{ color: '#374151' }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ ...sectionStyle, background: '#f8fafc' }}>
        <div style={maxWidthStyle}>
          <p style={{ color: '#10b981', fontWeight: 600, textAlign: 'center', fontSize: '14px', marginBottom: '8px' }}>TESTIMONI</p>
          <h2 style={headingStyle}>Apa Kata Mereka?</h2>
          <p style={subheadingStyle}>Kisah sukses dari pengguna platform kami</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ display: 'flex', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} color="#facc15" fill="#facc15" />)}
                </div>
                <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{t.role} • {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: 'clamp(60px, 10%, 100px) 5%', color: 'white', textAlign: 'center' }}>
        <div style={maxWidthStyle}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '16px' }}>
            Siap Memulai Perjalanan Karir?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '500px', margin: '0 auto 40px' }}>
            Bergabunglah dengan ribuan profesional yang telah menemukan pekerjaan impian mereka
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Link href="/register/jobseeker" style={{ ...buttonPrimary, background: 'white', color: '#4f46e5' }}>
              <Users size={20} />
              Daftar Sebagai Jobseeker
              <ArrowRight size={18} />
            </Link>
            <Link href="/register/recruiter" style={{ ...buttonPrimary, background: 'transparent', border: '2px solid white' }}>
              <Building2 size={20} />
              Daftar Sebagai Recruiter
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div style={sectionStyle}>
        <div style={{ ...maxWidthStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: 'clamp(32px, 5%, 48px)', color: 'white' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Hubungi Kami</h3>
            <p style={{ opacity: 0.9, marginBottom: '32px', lineHeight: 1.7 }}>Punya pertanyaan? Tim kami siap membantu.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Email</div>
                  <div style={{ opacity: 0.9, fontSize: '14px' }}>support@jobseeker.id</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Telepon</div>
                  <div style={{ opacity: 0.9, fontSize: '14px' }}>+62 21 1234 5678</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Alamat</div>
                  <div style={{ opacity: 0.9, fontSize: '14px' }}>Jakarta Pusat, Indonesia</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: 'clamp(32px, 5%, 48px)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>Kirim Pesan</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Nama Anda" style={{ padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', color: '#111827' }} />
              <input type="email" placeholder="Email Anda" style={{ padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', color: '#111827' }} />
              <textarea rows="4" placeholder="Pesan Anda..." style={{ padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', outline: 'none', resize: 'vertical', color: '#111827' }}></textarea>
              <button type="submit" style={{ ...buttonPrimary, justifyContent: 'center' }}>Kirim Pesan</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage