'use client'
import RecruiterSidebar from '@/components/RecruiterSidebar'
import Header from '@/components/Header'

export default function RecruiterLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 pt-[80px]"> {/* Offset for the fixed global header */}
            {/* Sidebar - Fixed Left, below header */}
            <aside className="hidden lg:block w-64 fixed left-0 top-[80px] bottom-0 overflow-y-auto bg-slate-900 z-40">
                <RecruiterSidebar />
            </aside>

            {/* Main Content - Pushed right, with footer clearance */}
            <main className="flex-1 lg:ml-64 p-8 pb-32 w-full min-h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    )
}
