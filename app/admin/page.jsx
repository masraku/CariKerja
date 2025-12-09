'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Building2, Briefcase, UserCheck, ArrowRight, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token')
            
            const [statsRes, chartRes] = await Promise.all([
                // Existing stats
                Promise.all([
                    fetch('/api/admin/jobseekers/stats', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/admin/companies?status=pending', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]),
                // Chart data
                fetch('/api/admin/chart-stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            const [jobseekersRes, companiesRes] = statsRes
            const jobseekersData = await jobseekersRes.json()
            const companiesData = await companiesRes.json()
            const chartDataRes = await chartRes.json()

            if (jobseekersData.success && companiesData.success) {
                setStats({
                    jobseekers: jobseekersData.data,
                    pendingCompanies: companiesData.data.count
                })
            }

            if (chartDataRes.success) {
                setChartData(chartDataRes.data)
            }
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#10b981', '#94a3b8']
    const COLORS_LOOKING = ['#f59e0b', '#cbd5e1']

    // Prepare pie chart data
    const employmentPieData = chartData ? [
        { name: 'Sudah Bekerja', value: chartData.employment.employed },
        { name: 'Belum Bekerja', value: chartData.employment.unemployed }
    ] : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-10">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-slate-300">Selamat datang di panel administrasi</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Total Jobseekers */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-xs text-slate-400">Total</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                            {loading ? <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse"></span> : (stats?.jobseekers?.totalJobseekers || 0)}
                        </div>
                        <div className="text-sm text-slate-500">Jobseekers Terdaftar</div>
                    </div>

                    {/* Employed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {loading ? '-' : `${Math.round((stats?.jobseekers?.employed / stats?.jobseekers?.totalJobseekers) * 100) || 0}%`}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                            {loading ? <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse"></span> : (stats?.jobseekers?.employed || 0)}
                        </div>
                        <div className="text-sm text-slate-500">Sudah Bekerja</div>
                    </div>

                    {/* Looking for Job */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                Aktif
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                            {loading ? <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse"></span> : (stats?.jobseekers?.lookingForJob || 0)}
                        </div>
                        <div className="text-sm text-slate-500">Mencari Kerja</div>
                    </div>

                    {/* Pending Companies */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            {(stats?.pendingCompanies || 0) > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                                    Perlu Review
                                </span>
                            )}
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                            {loading ? <span className="inline-block w-12 h-8 bg-slate-200 rounded animate-pulse"></span> : (stats?.pendingCompanies || 0)}
                        </div>
                        <div className="text-sm text-slate-500">Perusahaan Pending</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Jobs Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Lowongan per Bulan</h2>
                        <p className="text-sm text-slate-500 mb-4">Jumlah lowongan yang diposting 6 bulan terakhir</p>
                        <div className="h-64">
                            {loading ? (
                                <div className="h-full flex items-end justify-around gap-2 pb-6">
                                    {[40, 60, 30, 80, 50, 70].map((h, i) => (
                                        <div key={i} className="w-12 bg-slate-200 rounded-t animate-pulse" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            ) : chartData?.monthlyJobs && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.monthlyJobs} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis 
                                            dataKey="month" 
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12, fill: '#64748b' }}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            allowDecimals={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1e293b', 
                                                border: 'none', 
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            formatter={(value) => [`${value} lowongan`, 'Jumlah']}
                                        />
                                        <Bar 
                                            dataKey="count" 
                                            fill="#3b82f6" 
                                            radius={[6, 6, 0, 0]}
                                            name="Lowongan"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Employment Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Status Pekerjaan</h2>
                        <p className="text-sm text-slate-500 mb-4">Perbandingan jobseeker yang sudah dan belum bekerja</p>
                        <div className="h-64 flex items-center">
                            {loading ? (
                                <div className="w-full flex justify-center">
                                    <div className="w-40 h-40 rounded-full border-[20px] border-slate-200 animate-pulse"></div>
                                </div>
                            ) : chartData?.employment && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={employmentPieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {employmentPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#1e293b', 
                                                border: 'none', 
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            formatter={(value) => [`${value} orang`, '']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        {/* Legend */}
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm text-slate-600">Sudah Bekerja ({chartData?.employment?.employed || 0})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                                <span className="text-sm text-slate-600">Belum Bekerja ({chartData?.employment?.unemployed || 0})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Menu Cepat</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Companies */}
                    <Link 
                        href="/admin/companies"
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:border-orange-200 transition group"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Verifikasi Perusahaan</h3>
                        <p className="text-sm text-slate-500 mb-4">Review dan verifikasi perusahaan baru</p>
                        <span className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium group-hover:gap-2 transition-all">
                            Lihat Pending
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    {/* Jobseekers */}
                    <Link 
                        href="/admin/jobseekers"
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:border-blue-200 transition group"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Kelola Jobseeker</h3>
                        <p className="text-sm text-slate-500 mb-4">Monitor semua pencari kerja terdaftar</p>
                        <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                            Kelola Data
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    {/* Jobs */}
                    <Link 
                        href="/admin/jobs"
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:border-emerald-200 transition group"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <Briefcase className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Manajemen Lowongan</h3>
                        <p className="text-sm text-slate-500 mb-4">Kelola semua lowongan pekerjaan</p>
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium group-hover:gap-2 transition-all">
                            Lihat Lowongan
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    {/* Verified Companies */}
                    <Link 
                        href="/admin/companies?status=verified"
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg hover:border-purple-200 transition group"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition">
                            <CheckCircle className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">Perusahaan Verified</h3>
                        <p className="text-sm text-slate-500 mb-4">Lihat semua perusahaan terverifikasi</p>
                        <span className="inline-flex items-center gap-1 text-sm text-purple-600 font-medium group-hover:gap-2 transition-all">
                            Lihat Semua
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>

                {/* Application Stats Summary */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Lamaran</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{stats?.jobseekers?.totalApplications || 0}</div>
                            <div className="text-sm text-slate-500">Total Lamaran</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">{stats?.jobseekers?.acceptedApplications || 0}</div>
                            <div className="text-sm text-slate-500">Diterima</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{stats?.jobseekers?.pendingApplications || 0}</div>
                            <div className="text-sm text-slate-500">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{stats?.jobseekers?.rejectedApplications || 0}</div>
                            <div className="text-sm text-slate-500">Ditolak</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
