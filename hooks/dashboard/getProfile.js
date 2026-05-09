import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api"; // CSRF-protected axios instance

const getAuthHeader = () => ({});

// ============ PROFILE ============
const queryKeyGetProfile = ["getProfile"];

export function useQueryGetProfile() {
    return useQuery({
        queryKey: queryKeyGetProfile,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/jobseeker", {
                headers: getAuthHeader(),
                withCredentials: true,
            });
            return data;
        },
        staleTime: 0, // Always consider data stale to ensure fresh fetch
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

// ============ DASHBOARD STATS ============
const queryKeyDashboardStats = ["dashboardStats"];

export function useQueryDashboardStats(enabled = true) {
    return useQuery({
        queryKey: queryKeyDashboardStats,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/jobseeker/my-applications", {
                headers: getAuthHeader(),
                withCredentials: true,
            });
            
            if (!data.success) throw new Error("Failed to fetch stats");
            
            return {
                totalApplications: data.data.total,
                pending: (data.data.stats.PENDING || 0) + (data.data.stats.REVIEWING || 0),
                interview: (data.data.stats.INTERVIEW_SCHEDULED || 0) + (data.data.stats.INTERVIEW_COMPLETED || 0),
                accepted: data.data.stats.ACCEPTED || 0,
                recentApplications: data.data.applications.slice(0, 3),
            };
        },
        enabled,
    });
}

// ============ EMPLOYMENT STATUS ============
const queryKeyEmploymentStatus = ["employmentStatus"];

export function useQueryEmploymentStatus(enabled = true) {
    return useQuery({
        queryKey: queryKeyEmploymentStatus,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/jobseeker/status", {
                headers: getAuthHeader(),
                withCredentials: true,
            });
            
            if (!data.success) throw new Error("Failed to fetch status");
            
            return {
                isEmployed: data.data.isEmployed || false,
                isLookingForJob: data.data.isLookingForJob ?? true,
                employedCompany: data.data.employedCompany || "",
                employedAt: data.data.employedAt,
            };
        },
        enabled,
    });
}

export function useMutationEmploymentStatus() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (updateData) => {
            // Use api for PUT (CSRF protected)
            const { data } = await api.put("/api/profile/jobseeker/status", updateData, {
                headers: getAuthHeader(),
                withCredentials: true,
            });
            
            return {
                isEmployed: data.data.isEmployed || false,
                isLookingForJob: data.data.isLookingForJob ?? true,
                employedCompany: data.data.employedCompany || "",
                employedAt: data.data.employedAt,
            };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeyEmploymentStatus, data);
        },
    });
}
