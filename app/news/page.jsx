'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Tag, Clock, Search } from 'lucide-react'

export default function NewsPage() {
    const [searchQuery, setSearchQuery] = useState('')

    // Dummy Data for development since no API endpoint exists yet
    const featuredNews = {
        id: 1,
        title: "Tren Teknologi Web Development di Tahun 2025",
        excerpt: "Simak pembahasan mendalam mengenai teknologi-teknologi baru yang akan mendominasi industri pengembangan web di tahun mendatang.",
        image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
        date: "23 Des 2024",
        author: "Raku Tech",
        category: "Teknologi",
        readTime: "5 min read"
    }

    const newsList = [
        {
            id: 2,
            title: "Tips Sukses Interview Kerja untuk Fresh Graduate",
            excerpt: "Panduan lengkap menghadapi wawancara kerja pertama kali, mulai dari persiapan mental hingga teknis.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            date: "22 Des 2024",
            author: "HR Expert",
            category: "Karir",
            readTime: "4 min read"
        },
        {
            id: 3,
            title: "Pentingnya Soft Skill di Dunia Kerja Modern",
            excerpt: "Mengapa kemampuan teknis saja tidak cukup? Pelajari soft skill yang paling dicari perusahaan saat ini.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            date: "21 Des 2024",
            author: "Career Coach",
            category: "Tips",
            readTime: "3 min read"
        },
        {
            id: 4,
            title: "Remote Work: Tantangan dan Peluang",
            excerpt: "Analisis mendalam mengenai budaya kerja jarak jauh yang semakin populer pasca pandemi.",
            image: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            date: "20 Des 2024",
            author: "Digital Nomad",
            category: "Lifestyle",
            readTime: "6 min read"
        },
        {
            id: 5,
            title: "Membangun Portofolio yang Menarik",
            excerpt: "Cara menyusun portofolio yang efektif untuk menarik perhatian rekruter dan klien potensial.",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            date: "19 Des 2024",
            author: "Design Lead",
            category: "Portfolio",
            readTime: "4 min read"
        },
        {
            id: 6,
            title: "Strategi Negosiasi Gaji",
            excerpt: "Tips jitu melakukan negosiasi gaji agar mendapatkan kompensasi yang layak sesuai keahlian.",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            date: "18 Des 2024",
            author: "Finance Guru",
            category: "Gaji",
            readTime: "5 min read"
        }
    ]

    const filteredNews = newsList.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase mb-2 block">
                            Blog & Artikel
                        </span>
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Wawasan Karir & Teknologi
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Temukan artikel terbaru seputar pengembangan karir, tips interview, dan tren teknologi terkini untuk menunjang kesuksesanmu.
                        </p>
                    </div>

                    {/* Featured Article */}
                    <div className="relative rounded-3xl overflow-hidden group shadow-xl shadow-slate-200/50">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                        <img 
                            src={featuredNews.image} 
                            alt={featuredNews.title}
                            className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-8 lg:p-12 z-20 max-w-3xl">
                            <div className="flex items-center gap-3 text-white/80 text-sm mb-4">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                    {featuredNews.category}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {featuredNews.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {featuredNews.readTime}
                                </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                                {featuredNews.title}
                            </h2>
                            <p className="text-lg text-white/90 mb-6 line-clamp-2">
                                {featuredNews.excerpt}
                            </p>
                            <Link 
                                href="#" 
                                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                            >
                                Baca Selengkapnya
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <h3 className="text-2xl font-bold text-slate-900">Artikel Terbaru</h3>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari artikel..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNews.map((news) => (
                        <article 
                            key={news.id} 
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all duration-300 group flex flex-col h-full"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-slate-200/50">
                                        {news.category}
                                    </span>
                                </div>
                                <img 
                                    src={news.image} 
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-slate-500 text-xs mb-3 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {news.date}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="flex items-center gap-1">
                                        <User className="w-3.5 h-3.5" />
                                        {news.author}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {news.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {news.excerpt}
                                </p>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {news.readTime}
                                    </span>
                                    <Link 
                                        href="#"
                                        className="text-blue-600 font-bold text-sm flex items-center gap-1 group/link"
                                    >
                                        Baca
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredNews.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak ada artikel ditemukan</h3>
                        <p className="text-slate-500">Coba kata kunci lain atau reset pencarian Anda.</p>
                    </div>
                )}
                
                {/* Pagination (Visual Only) */}
                {filteredNews.length > 0 && (
                    <div className="mt-16 flex justify-center gap-2">
                         {[1, 2, 3].map(i => (
                            <button 
                                key={i}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                    i === 1 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                            >
                                {i}
                            </button>
                         ))}
                    </div>
                )}
            </div>
            
            {/* Newsletter Section */}
            <div className="bg-slate-900 text-white py-20 px-4">
                 <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Dapatkan Update Terbaru</h2>
                    <p className="text-slate-400 mb-8">Berlangganan newsletter kami untuk mendapatkan tips karir dan info lowongan terbaru setiap minggunya.</p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="email" 
                            placeholder="Email Anda" 
                            className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-600/30">
                            Berlangganan
                        </button>
                    </form>
                 </div>
            </div>
        </div>
    )
}
