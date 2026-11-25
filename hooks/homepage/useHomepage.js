import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ============ HOMEPAGE STATS ============
const queryKeyHomepageStats = ["homepageStats"];

export function useQueryHomepageStats(initialData) {
    return useQuery({
        queryKey: queryKeyHomepageStats,
        initialData,
        queryFn: async () => {
            const { data } = await axios.get("/api/homepage/stats");

            if (!data.success) throw new Error("Failed to fetch stats");

            return data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// ============ FEATURED JOBS ============
const queryKeyFeaturedJobs = ["featuredJobs"];

export function useQueryFeaturedJobs(limit = 6, initialData) {
    return useQuery({
        queryKey: [...queryKeyFeaturedJobs, limit],
        initialData,
        queryFn: async () => {
            const { data } = await axios.get("/api/homepage/featured-jobs", {
                params: { limit },
            });

            if (!data.success) throw new Error("Failed to fetch featured jobs");

            return data.data.jobs;
        },
        staleTime: 0,
        refetchOnMount: "always",
    });
}

// ============ TOP COMPANIES ============
const queryKeyTopCompanies = ["topCompanies"];

export function useQueryTopCompanies(limit = 6, initialData) {
    return useQuery({
        queryKey: [...queryKeyTopCompanies, limit],
        initialData,
        queryFn: async () => {
            const { data } = await axios.get("/api/homepage/top-companies", {
                params: { limit },
            });

            if (!data.success) throw new Error("Failed to fetch top companies");

            return data.data.companies;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// ============ COMBINED HOOK FOR LANDING PAGE ============
// initialData berasal dari server (app/page.jsx) agar konten tampil tanpa
// menunggu request API; React Query tetap memperbarui data di background.
export function useHomepageData(initialData = {}) {
    const statsQuery = useQueryHomepageStats(initialData.stats);
    const featuredJobsQuery = useQueryFeaturedJobs(6, initialData.featuredJobs);
    const topCompaniesQuery = useQueryTopCompanies(6, initialData.topCompanies);

    const isLoading = statsQuery.isPending || featuredJobsQuery.isPending || topCompaniesQuery.isPending;
    const isError = statsQuery.isError || featuredJobsQuery.isError || topCompaniesQuery.isError;

    return {
        stats: statsQuery.data,
        featuredJobs: featuredJobsQuery.data || [],
        topCompanies: topCompaniesQuery.data || [],
        isLoading,
        isError,
        // Individual loading states
        isLoadingStats: statsQuery.isPending,
        isLoadingJobs: featuredJobsQuery.isPending,
        isLoadingCompanies: topCompaniesQuery.isPending,
    };
}
