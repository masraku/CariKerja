import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============ PROFILE ============
const queryKeyGetProfile = ["getProfile"];

export function useQueryGetProfile() {
    return useQuery({
        queryKey: queryKeyGetProfile,
        queryFn: async () => {
            const response = await fetch("/api/profile/jobseeker", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            return data;
        },
    });
}

// ============ DASHBOARD STATS ============
const queryKeyDashboardStats = ["dashboardStats"];

export function useQueryDashboardStats(enabled = true) {
    return useQuery({
        queryKey: queryKeyDashboardStats,
        queryFn: async () => {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token");

            const response = await fetch("/api/profile/jobseeker/my-applications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            
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
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token");

            const response = await fetch("/api/profile/jobseeker/status", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            
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
            const token = localStorage.getItem("token");
            const response = await fetch("/api/profile/jobseeker/status", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error("Failed to update status");
            
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