'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
    Shield, Target, Eye, Users, Briefcase, Award, CheckCircle, Heart, 
    Globe, Zap, Building2, UserCheck, FileCheck, Star, ArrowRight, 
    Mail, Phone, MapPin 
} from 'lucide-react'

const AboutPage = () => {
    const [activeYear, setActiveYear] = useState(2024)

    const stats = [
        { icon: Users, value: '100K+', label: 'Pencari Kerja', color: 'bg-blue-500' },
        { icon: Building2, value: '5K+', label: 'Perusahaan', color: 'bg-emerald-500' },
        { icon: Briefcase, value: '50K+', label: 'Lowongan', color: 'bg-purple-500' },
        { icon: UserCheck, value: '75K+', label: 'Diterima Kerja', color: 'bg-amber-500' }
    ]

    const features = [
        { icon: Shield, title: 'Platform Resmi Pemerintah', desc: 'Dikelola langsung oleh Disnaker dan Kominfo', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { icon: FileCheck, title: 'Verifikasi Perusahaan', desc: 'Semua perusahaan diverifikasi legalitasnya', color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
        { icon: Globe, title: 'Akses Gratis', desc: '100% gratis untuk pencari kerja', color: 'bg-purple-500', bgColor: 'bg-purple-50' },
        { icon: Zap, title: 'Proses Cepat', desc: 'Sistem matching otomatis yang akurat', color: 'bg-amber-500', bgColor: 'bg-amber-50' },
        { icon: Award, title: 'Standar Profesional', desc: 'Menjunjung tinggi profesionalitas', color: 'bg-pink-500', bgColor: 'bg-pink-50' },
        { icon: Heart, title: 'Dukungan 24/7', desc: 'Tim support siap membantu kapan saja', color: 'bg-indigo-500', bgColor: 'bg-indigo-50' }
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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-4 lg:px-8 py-16 lg:py-24 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full mb-8 border border-white/20">
                        <span className="text-2xl">🇮🇩</span>
                        <div className="text-left">
                            <div className="text-xs text-white/80">Platform Resmi Pemerintah</div>
                            <div className="text-white font-semibold">Disnaker & Kominfo RI</div>
                        </div>
                    </div>

                    <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        Membangun Masa Depan
                        <br />
                        <span className="text-slate-300">Ketenagakerjaan Indonesia</span>
                    </h1>
                    <p className="text-slate-300 max-w-2xl mx-auto mb-12 text-lg">
                        Platform digital terpercaya yang menghubungkan talenta terbaik Indonesia dengan perusahaan berkualitas
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon
                            return (
                                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center">
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="px-4 lg:px-8 py-16 lg:py-20 bg-white">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-2xl p-8 border-t-4 border-blue-500">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                            <Eye className="w-7 h-7 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Visi Kami</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Menjadi platform ketenagakerjaan digital nomor satu di Indonesia yang terpercaya, transparan, dan inklusif.
                        </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-8 border-t-4 border-emerald-500">
                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                            <Target className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-3">Misi Kami</h2>
                        <ul className="text-slate-600 leading-relaxed space-y-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                Menyediakan akses kerja yang mudah dan merata
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                Memastikan keamanan dan transparansi
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                Meningkatkan kualitas SDM Indonesia
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="px-4 lg:px-8 py-16 lg:py-20 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-semibold text-sm">KEUNGGULAN PLATFORM</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mt-2 mb-3">Mengapa Memilih Kami?</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Platform dengan standar pemerintah untuk keamanan dan kredibilitas maksimal
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition text-center">
                                    <div className={`w-16 h-16 ${f.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                        <Icon className={`w-8 h-8 ${f.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{f.title}</h3>
                                    <p className="text-slate-500 text-sm">{f.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 lg:px-8 py-16 lg:py-20 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-purple-600 font-semibold text-sm">PERJALANAN KAMI</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mt-2 mb-3">Milestone & Pencapaian</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Dari ide hingga menjadi platform ketenagakerjaan terbesar di Indonesia
                        </p>
                    </div>

                    {/* Year Buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {timeline.map(item => (
                            <button
                                key={item.year}
                                onClick={() => setActiveYear(item.year)}
                                className={`px-6 py-3 rounded-xl font-semibold transition ${
                                    activeYear === item.year
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {item.year}
                            </button>
                        ))}
                    </div>

                    {/* Active Year Content */}
                    {timeline.filter(t => t.year === activeYear).map(item => (
                        <div key={item.year} className="bg-slate-50 rounded-2xl p-6 lg:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                    {item.year}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">{item.title}</h3>
                            </div>
                            <div className="space-y-3">
                                {item.achievements.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                        <span className="text-slate-700">{a}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials */}
            <div className="px-4 lg:px-8 py-16 lg:py-20 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="text-emerald-600 font-semibold text-sm">TESTIMONI</span>
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mt-2 mb-3">Apa Kata Mereka?</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">
                            Kisah sukses dari pengguna platform kami
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{t.name}</div>
                                        <div className="text-sm text-slate-500">{t.role} • {t.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-4 lg:px-8 py-16 lg:py-20 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Siap Memulai Perjalanan Karir?
                    </h2>
                    <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                        Bergabunglah dengan ribuan profesional yang telah menemukan pekerjaan impian mereka
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/login?action=register&role=jobseeker"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 transition shadow-lg"
                        >
                            <Users className="w-5 h-5" />
                            Daftar Sebagai Jobseeker
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/login?action=register&role=recruiter"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/20"
                        >
                            <Building2 className="w-5 h-5" />
                            Daftar Sebagai Rekruter
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div className="px-4 lg:px-8 py-16 lg:py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
                        {/* Contact Info */}
                        <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-8 lg:p-10 text-white">
                            <h3 className="text-2xl font-bold mb-3">Hubungi Kami</h3>
                            <p className="text-slate-300 mb-8">Punya pertanyaan? Tim kami siap membantu.</p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Email</div>
                                        <div className="text-slate-300 text-sm">support@jobseeker.id</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Telepon</div>
                                        <div className="text-slate-300 text-sm">+62 21 1234 5678</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold mb-1">Alamat</div>
                                        <div className="text-slate-300 text-sm">Jakarta Pusat, Indonesia</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 lg:p-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Kirim Pesan</h3>
                            <form className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nama Anda"
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Anda"
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                                />
                                <textarea
                                    rows="4"
                                    placeholder="Pesan Anda..."
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 resize-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                                >
                                    Kirim Pesan
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPage