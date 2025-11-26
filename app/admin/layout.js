'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login')
            } else if (user.role !== 'ADMIN') {
                router.push('/')
            }
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!user || user.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
