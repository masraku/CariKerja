'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, User, ArrowRight, Search, Newspaper, Eye, ChevronLeft, ChevronRight, TrendingUp, BookOpen } from 'lucide-react'

export default function NewsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [news, setNews] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        fetchNews()
    }, [searchQuery, selectedCategory, pagination.page])

    const fetchNews = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (selectedCategory !== 'all') params.append('category', selectedCategory)
            params.append('page', pagination.page)
            params.append('limit', 6) // Always show 6 items

            const response = await fetch(`/api/news?${params.toString()}`)
            const data = await response.json()

            if (data.success) {
                setNews(data.news || [])
                setCategories(data.categories || [])
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.total || 0,
                    totalPages: data.pagination?.totalPages || 0
                }))
            }
        } catch (error) {
            console.error('Error fetching news:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Background Image */}
            <div className="relative bg-[#03587f] overflow-hidden px-4 lg:px-8 py-20 lg:py-28">
                <div className="absolute inset-0 bg-gradient-to-br from-[#03587f] via-[#024666] to-indigo-900 opacity-95" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-5xl mx-auto text-center z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                        <BookOpen className="w-4 h-4 text-yellow-300" />
                        <span className="text-sm text-white font-medium">
                            Informasi Terkini Dunia Kerja
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Berita & Artikel
                    </h1>
                    <p className="text-blue-100 text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Dapatkan informasi terbaru seputar ketenagakerjaan, tips karir, dan perkembangan dunia kerja
                    </p>

                    {/* Search Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 lg:p-3 shadow-2xl border border-white/20 max-w-2xl mx-auto">
                        <div className="relative bg-white rounded-xl overflow-hidden flex items-center">
                            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berita, artikel, atau topik..."
                                className="w-full pl-12 pr-4 py-4 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setPagination(prev => ({ ...prev, page: 1 }))
                                }}
                            />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-8 lg:gap-16 mt-12">
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                                {pagination.total || news.length}+
                            </div>
                            <div className="text-sm text-blue-200 font-medium uppercase tracking-wider">
                                Total Artikel
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-1">
                                {categories.length}
                            </div>
                            <div className="text-sm text-blue-200 font-medium uppercase tracking-wider">
                                Kategori
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
                {/* Category Filter */}
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5 mb-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-700 font-semibold text-sm mr-2">Kategori:</span>
                        <button
                            onClick={() => {
                                setSelectedCategory('all')
                                setPagination(prev => ({ ...prev, page: 1 }))
                            }}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                selectedCategory === 'all'
                                    ? 'bg-[#03587f] text-white shadow-lg shadow-[#03587f]/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat)
                                    setPagination(prev => ({ ...prev, page: 1 }))
                                }}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-[#03587f] text-white shadow-lg shadow-[#03587f]/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                <div className="h-52 bg-gray-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                    <div className="h-6 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Newspaper className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Berita</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchQuery || selectedCategory !== 'all' 
                                ? 'Tidak ada berita yang sesuai dengan pencarian Anda. Coba kata kunci lain.' 
                                : 'Berita akan segera tersedia. Kembali lagi nanti!'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* News Grid - 6 Columns (3x2) */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => (
                                <Link 
                                    key={item.id}
                                    href={`/news/${item.slug}`}
                                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 hover:border-[#03587f]/20 transition-all duration-300 group flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative h-52 overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-[#03587f] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                                                {item.category}
                                            </span>
                                        </div>
                                        {item.image ? (
                                            <img 
                                                src={item.image} 
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <Newspaper className="w-16 h-16 text-gray-300" />
                                            </div>
                                        )}
                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Meta */}
                                        <div className="flex items-center gap-3 text-gray-500 text-sm mb-4">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(item.publishedAt)}
                                            </span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-4 h-4" />
                                                {item.author}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#03587f] transition-colors leading-tight">
                                            {item.title}
                                        </h3>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 text-sm line-clamp-3 flex-1 leading-relaxed">
                                            {item.excerpt || 'Klik untuk membaca selengkapnya...'}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                                <Eye className="w-4 h-4" />
                                                {item.viewCount || 0} dibaca
                                            </span>
                                            <span className="text-[#03587f] font-bold text-sm flex items-center gap-1.5 group-hover:gap-3 transition-all">
                                                Baca Selengkapnya
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-3">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                            page === pagination.page 
                                            ? 'bg-[#03587f] text-white shadow-lg shadow-[#03587f]/30' 
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
