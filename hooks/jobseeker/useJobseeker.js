import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Helper to get auth header
const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ============ JOBSEEKER APPLICATIONS ============
const queryKeyApplications = ["jobseekerApplications"];

export function useQueryJobseekerApplications({
    status = "ALL",
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyApplications, { status }],
        queryFn: async () => {
            const params = {};
            if (status !== "ALL") params.status = status;

            const { data } = await axios.get("/api/profile/jobseeker/my-applications", {
                headers: getAuthHeader(),
                params,
            });

            if (!data.success) throw new Error("Gagal memuat daftar lamaran");

            return {
                applications: data.data.applications || [],
                stats: data.data.stats || {},
                total: data.data.total || 0,
            };
        },
        enabled,
    });
}

// ============ APPLICATION DETAIL ============
const queryKeyApplicationDetail = ["applicationDetail"];

export function useQueryApplicationDetail(id, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyApplicationDetail, id],
        queryFn: async () => {
            if (!id) throw new Error("Tidak ada ID lamaran");

            const { data } = await axios.get(`/api/applications/${id}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat detail lamaran");

            return data.data;
        },
        enabled: enabled && !!id,
    });
}

// ============ WITHDRAW APPLICATION ============
export function useMutationWithdrawApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (applicationId) => {
            const { data } = await axios.patch(
                `/api/applications/${applicationId}/withdraw`,
                {},
                { headers: getAuthHeader() }
            );

            if (!data.success) throw new Error(data.error || "Gagal menarik lamaran");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyApplications });
        },
    });
}

// ============ JOBSEEKER INTERVIEWS ============
const queryKeyJobseekerInterviews = ["jobseekerInterviews"];

export function useQueryJobseekerInterviews(enabled = true) {
    return useQuery({
        queryKey: queryKeyJobseekerInterviews,
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/jobseeker/interviews", {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat daftar interview");

            return {
                upcoming: data.data.upcoming || [],
                past: data.data.past || [],
            };
        },
        enabled,
    });
}

// ============ INTERVIEW DETAIL ============
const queryKeyInterviewDetail = ["interviewDetail"];

export function useQueryInterviewDetail(id, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyInterviewDetail, id],
        queryFn: async () => {
            if (!id) throw new Error("Tidak ada ID interview");

            const { data } = await axios.get(`/api/interviews/${id}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat detail interview");

            return data.data;
        },
        enabled: enabled && !!id,
    });
}

// ============ INTERVIEW ROOM ============
const queryKeyInterviewRoom = ["interviewRoom"];

export function useQueryInterviewRoom(id, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyInterviewRoom, id],
        queryFn: async () => {
            if (!id) throw new Error("Tidak ada ID interview");

            const { data } = await axios.get(`/api/interviews/${id}/room`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error(data.error || "Gagal memuat ruang interview");

            return data.data;
        },
        enabled: enabled && !!id,
    });
}

// ============ JOBSEEKER PROFILE VIEW ============
const queryKeyJobseekerProfile = ["jobseekerProfileView"];

export function useQueryJobseekerProfileView(enabled = true) {
    return useQuery({
        queryKey: queryKeyJobseekerProfile,
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/jobseeker", {
                withCredentials: true,
            });

            return data.profile;
        },
        enabled,
    });
}

// ============ UPDATE JOB SEEKING STATUS ============
export function useMutationUpdateJobSeekingStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (isLookingForJob) => {
            const { data } = await axios.put(
                "/api/profile/jobseeker/status",
                { isLookingForJob },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyJobseekerProfile });
        },
    });
}

// ============ JOBSEEKER PROFILE FULL (for Edit Page) ============
const queryKeyJobseekerProfileFull = ["jobseekerProfileFull"];

export function useQueryJobseekerProfileFull(enabled = true) {
    return useQuery({
        queryKey: queryKeyJobseekerProfileFull,
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/jobseeker", {
                withCredentials: true,
            });
            return data.profile;
        },
        enabled,
    });
}

export function useMutationSaveJobseekerProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profileData) => {
            const { data } = await axios.post("/api/profile/jobseeker", profileData, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyJobseekerProfileFull });
            queryClient.invalidateQueries({ queryKey: queryKeyJobseekerProfile });
        },
    });
}
