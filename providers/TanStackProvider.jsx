"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function TanStackProvider({ children }) {
    return <QueryClientProvider client={new QueryClient()}>
        {children}
    </QueryClientProvider>
}