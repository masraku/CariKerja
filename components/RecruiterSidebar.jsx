'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, PlusCircle, Users, Briefcase, 
    Settings, LogOut, Building2, User
} from 'lucide-react'

export default function RecruiterSidebar() {
    const pathname = usePathname()

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/profile/recruiter/dashboard' },
        { icon: PlusCircle, label: 'Pasang Lowongan', href: '/profile/recruiter/post-job' },
        { icon: Briefcase, label: 'Lowongan Saya', href: '/profile/recruiter/dashboard/jobs' }, // Assumed route
        { icon: Users, label: 'Pelamar', href: '/profile/recruiter/dashboard/applications' }, // Assumed route
        { icon: User, label: 'Profil Perusahaan', href: '/profile/recruiter' },
    ]

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <Link href="/profile/recruiter/dashboard" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">Recruiter</div>
                        <div className="text-xs text-slate-400">Panel Perusahaan</div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        
                        // More specific active state logic
                        let isActive = false
                        if (item.href === '/profile/recruiter/dashboard') {
                            // Dashboard only active on exact match
                            isActive = pathname === '/profile/recruiter/dashboard'
                        } else if (item.href === '/profile/recruiter') {
                            // Profile only on exact /profile/recruiter
                            isActive = pathname === '/profile/recruiter'
                        } else if (item.href === '/profile/recruiter/dashboard/jobs') {
                            // Jobs active for /dashboard/jobs but NOT /dashboard/applications
                            isActive = pathname.startsWith('/profile/recruiter/dashboard/jobs')
                        } else if (item.href === '/profile/recruiter/dashboard/applications') {
                            // Applications active for /dashboard/applications
                            isActive = pathname.startsWith('/profile/recruiter/dashboard/applications')
                        } else {
                            // Other items: exact match
                            isActive = pathname === item.href
                        }
                        
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="flex-1 font-medium">{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Keluar</span>
                </button>
            </div>
        </div>
    )
}
