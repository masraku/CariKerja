'use client'
import { useEffect, useState } from 'react'
import { Users, Building2, Briefcase, UserCheck } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token')
            
            const [jobseekersRes, companiesRes] = await Promise.all([
                fetch('/api/admin/jobseekers/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/admin/companies?status=pending', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ])

            const jobseekersData = await jobseekersRes.json()
            const companiesData = await companiesRes.json()

            if (jobseekersData.success && companiesData.success) {
                setStats({
                    jobseekers: jobseekersData.data,
                    pendingCompanies: companiesData.data.count
                })
            }
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                {/* Total Jobseekers */}
                <StatsCard
                    icon={Users}
                    label="Total Jobseekers"
                    value={stats?.jobseekers?.totalJobseekers || 0}
                    color="blue"
                />

                {/* Employed */}
                <StatsCard
                    icon={UserCheck}
                    label="Sudah Bekerja"
                    value={stats?.jobseekers?.employed || 0}
                    color="green"
                    subtitle={`${stats?.jobseekers?.unemployed || 0} belum bekerja`}
                />

                {/* Looking for Job */}
                <StatsCard
                    icon={Briefcase}
                    label="Masih Cari Kerja"
                    value={stats?.jobseekers?.lookingForJob || 0}
                    color="yellow"
                    subtitle={`${stats?.jobseekers?.notLooking || 0} tidak aktif cari`}
                />

                {/* Applications */}
                <StatsCard
                    icon={Users}
                    label="Total Lamaran"
                    value={stats?.jobseekers?.totalApplications || 0}
                    color="indigo"
                    subtitle={`${stats?.jobseekers?.acceptedApplications || 0} diterima`}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Pending Companies */}
                <div className="bg-white border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats?.pendingCompanies || 0}</div>
                            <div className="text-gray-600">Pending Companies</div>
                        </div>
                    </div>
                    <a
                        href="/admin/companies"
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                        Review Companies →
                    </a>
                </div>

                {/* Manage Jobseekers */}
                <div className="bg-white border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats?.jobseekers?.totalJobseekers || 0}</div>
                            <div className="text-gray-600">Total Jobseekers</div>
                        </div>
                    </div>
                    <a
                        href="/admin/jobseekers"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Kelola Jobseekers →
                    </a>
                </div>
            </div>
        </div>
    )
}

function StatsCard({ icon: Icon, label, value, color, subtitle }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600'
    }

    return (
        <div className="bg-white border border-gray-200  rounded-xl p-6">
            <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-gray-600 text-sm">{label}</div>
                </div>
            </div>
            {subtitle && (
                <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
            )}
        </div>
    )
}
