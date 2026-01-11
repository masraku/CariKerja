import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Helper to get auth header
const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ============ JOBS LIST ============
const queryKeyJobs = ["jobs"];

export function useQueryJobs({
    search = "",
    location = "",
    jobType = [],
    experience = [],
    sortBy = "latest",
    page = 1,
    limit = 20,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [
            ...queryKeyJobs,
            { search, location, jobType, experience, sortBy, page, limit },
        ],
        queryFn: async () => {
            const { data } = await axios.get("/api/jobs", {
                params: {
                    search: search || undefined,
                    location: location || undefined,
                    jobType: jobType.length > 0 ? jobType.join(",") : undefined,
                    experience: experience.length > 0 ? experience.join(",") : undefined,
                    sortBy,
                    page,
                    limit,
                },
                withCredentials: true,
            });

            if (!data.success) throw new Error("Failed to fetch jobs");

            return {
                jobs: data.data,
                pagination: data.pagination,
            };
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// ============ JOB DETAIL ============
const queryKeyJobDetail = ["jobDetail"];

export function useQueryJobDetail(slug, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyJobDetail, slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided");

            const { data } = await axios.get(`/api/jobs/${slug}`, {
                withCredentials: true,
            });

            if (!data.success) throw new Error("Failed to fetch job detail");

            return data.data;
        },
        enabled: enabled && !!slug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// ============ APPLY JOB ============
export function useMutationApplyJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, coverLetter }) => {
            const { data } = await axios.post(
                "/api/applications",
                { jobId, coverLetter },
                { headers: getAuthHeader() }
            );

            if (!data.success) throw new Error(data.error || "Failed to apply");

            return data;
        },
        onSuccess: (_, { slug }) => {
            queryClient.invalidateQueries({ queryKey: [...queryKeyJobDetail, slug] });
        },
    });
}
