import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api"; // CSRF-protected axios instance

// Helper to get auth header
const getAuthHeader = () => ({});

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

            const { data } = await api.get("/api/profile/jobseeker/my-applications", {
                headers: getAuthHeader(),
                params,
                withCredentials: true,
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

            const { data } = await api.get(`/api/applications/${id}`, {
                headers: getAuthHeader(),
                withCredentials: true,
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
            // Use api for PATCH (CSRF protected)
            const { data } = await api.patch(
                `/api/applications/${applicationId}/withdraw`,
                {},
                { headers: getAuthHeader(), withCredentials: true }
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
            const { data } = await api.get("/api/profile/jobseeker/interviews", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat daftar interview");

            return {
                interviews: data.data.interviews || [],
                pending: data.data.pending || [],
                responded: data.data.responded || [],
                stats: data.data.stats || {},
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

            const { data } = await api.get(`/api/interviews/${id}`, {
                headers: getAuthHeader(),
                withCredentials: true,
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

            const { data } = await api.get(`/api/interviews/${id}/room`, {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error(data.error || "Gagal memuat ruang interview");

            return data.data;
        },
        enabled: enabled && !!id,
    });
}

// ============ RESPOND TO INTERVIEW ============
export function useMutationRespondInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ participantId, status, message }) => {
            const { data } = await api.patch(
                `/api/profile/jobseeker/interviews/${participantId}/respond`,
                { status, message },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal mengirim respon");
            return data;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: queryKeyJobseekerInterviews });
        },
    });
}

// ============ JOBSEEKER PROFILE VIEW ============
const queryKeyJobseekerProfile = ["jobseekerProfileView"];

export function useQueryJobseekerProfileView(enabled = true) {
    return useQuery({
        queryKey: queryKeyJobseekerProfile,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/jobseeker", {
                withCredentials: true,
                headers: getAuthHeader(),
            });

            return data.profile;
        },
        enabled,
        staleTime: 0, // Always consider data stale to ensure fresh fetch
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

// ============ UPDATE JOB SEEKING STATUS ============
export function useMutationUpdateJobSeekingStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (isLookingForJob) => {
            // Use api for PUT (CSRF protected)
            const { data } = await api.put(
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
            const { data } = await api.get("/api/profile/jobseeker", {
                withCredentials: true,
                headers: getAuthHeader(),
            });
            return data.profile;
        },
        enabled,
        staleTime: 0, // Always consider data stale to ensure fresh fetch
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

export function useMutationSaveJobseekerProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profileData) => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post("/api/profile/jobseeker", profileData, {
                withCredentials: true,
            });
            return data;
        },
        onSuccess: async () => {
            // Await both invalidations to ensure cache is properly updated before navigation
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeyJobseekerProfileFull }),
                queryClient.invalidateQueries({ queryKey: queryKeyJobseekerProfile }),
            ]);
        },
    });
}

// ============ UPLOAD FILE ============
export function useMutationUploadFile() {
    return useMutation({
        mutationFn: async ({ file, bucket, userId }) => {
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                throw new Error("Ukuran file terlalu besar. Maksimal 2MB.");
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucket", bucket);
            if (userId) formData.append("userId", userId);

            // Use api for POST (CSRF protected)
            const { data } = await api.post("/api/upload", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return data;
        },
    });
}
