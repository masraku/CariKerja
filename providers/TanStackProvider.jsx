"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function TanStackProvider({ children }) {
    // QueryClient harus dibuat sekali dan di-persist menggunakan useState
    // agar tidak dibuat ulang setiap render
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data dianggap fresh selama 5 menit
                        staleTime: 5 * 60 * 1000,
                        // Cache disimpan selama 30 menit
                        gcTime: 30 * 60 * 1000,
                        // Tidak refetch otomatis saat window focus
                        refetchOnWindowFocus: false,
                        // Tidak refetch saat reconnect
                        refetchOnReconnect: false,
                        // Retry 1 kali jika gagal
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}