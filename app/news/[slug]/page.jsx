'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, ArrowLeft, ArrowRight, Tag, Clock, Eye, Share2, Newspaper } from 'lucide-react'

export default function NewsDetailPage() {
    const params = useParams()
    const [news, setNews] = useState(null)
    const [relatedNews, setRelatedNews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.slug) {
            fetchNews()
        }
    }, [params.slug])

    const fetchNews = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/news/${params.slug}`)
            const data = await response.json()

            if (data.success) {
                setNews(data.news)
                setRelatedNews(data.relatedNews || [])
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
            month: 'long',
            year: 'numeric'
        })
    }

    const calculateReadTime = (content) => {
        if (!content) return '1 min'
        const wordsPerMinute = 200
        const wordCount = content.split(/\s+/).length
        const readTime = Math.ceil(wordCount / wordsPerMinute)
        return `${readTime} min`
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: news?.title,
                    text: news?.excerpt || news?.title,
                    url: window.location.href
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link berhasil disalin!')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-slate-200 rounded w-1/3" />
                        <div className="h-12 bg-slate-200 rounded" />
                        <div className="h-6 bg-slate-200 rounded w-2/3" />
                        <div className="h-96 bg-slate-200 rounded-2xl" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded" />
                            <div className="h-4 bg-slate-200 rounded w-5/6" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Newspaper className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Berita Tidak Ditemukan</h1>
                    <p className="text-slate-500 mb-8">
                        Maaf, berita yang Anda cari tidak ditemukan atau sudah tidak tersedia.
                    </p>
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Berita
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Link */}
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Berita
                    </Link>

                    {/* Category & Meta */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {news.category}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(news.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                            <Clock className="w-4 h-4" />
                            {calculateReadTime(news.content)} baca
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                            <Eye className="w-4 h-4" />
                            {news.viewCount} views
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        {news.title}
                    </h1>

                    {/* Excerpt */}
                    {news.excerpt && (
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            {news.excerpt}
                        </p>
                    )}

                    {/* Author & Share */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">{news.author}</p>
                                <p className="text-sm text-slate-500">Penulis</p>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            Bagikan
                        </button>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {news.image && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                    <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50">
                        <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-auto max-h-[500px] object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
                    <div 
                        className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-blue-600 prose-strong:text-slate-900"
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {news.content}
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                                {news.category}
                            </span>
                        </div>
                    </div>
                </article>

                {/* Related News */}
                {relatedNews.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Artikel Terkait</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedNews.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/news/${item.slug}`}
                                    className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all duration-300 group"
                                >
                                    {item.image ? (
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-slate-100 flex items-center justify-center">
                                            <Newspaper className="w-10 h-10 text-slate-300" />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <span className="text-xs text-blue-600 font-semibold">
                                            {item.category}
                                        </span>
                                        <h3 className="font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-2">
                                            {formatDate(item.publishedAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-12 flex justify-center">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Lihat Semua Berita
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
