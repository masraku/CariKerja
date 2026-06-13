import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api"; // CSRF-protected axios instance

// Helper to get auth header
const getAuthHeader = () => ({});

// ============ RECRUITER DASHBOARD ============
const queryKeyRecruiterDashboard = ["recruiterDashboard"];

export function useQueryRecruiterDashboard(enabled = true) {
    return useQuery({
        queryKey: queryKeyRecruiterDashboard,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/recruiter/dashboard", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            return data.data;
        },
        enabled,
    });
}

// ============ RECRUITER PROFILE ============
const queryKeyRecruiterProfile = ["recruiterProfile"];

export function useQueryRecruiterProfile(enabled = true) {
    return useQuery({
        queryKey: queryKeyRecruiterProfile,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/recruiter", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat profil");

            return data.profile;
        },
        enabled,
        staleTime: 0, // Always consider data stale to ensure fresh fetch
        refetchOnMount: "always", // Always refetch when component mounts
    });
}

// ============ RECRUITER JOBS ============
const queryKeyRecruiterJobs = ["recruiterJobs"];

export function useQueryRecruiterJobs({
    status = "all",
    search = "",
    page = 1,
    limit = 10,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyRecruiterJobs, { status, search, page, limit }],
        queryFn: async () => {
            const { data } = await api.get("/api/profile/recruiter/jobs", {
                headers: getAuthHeader(),
                params: {
                    status: status !== "all" ? status : undefined,
                    search: search || undefined,
                    page,
                    limit,
                },
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat daftar lowongan");

            const payload = data.data || data;

            return {
                jobs: payload.jobs || [],
                pagination: payload.pagination,
                stats: payload.stats,
            };
        },
        enabled,
    });
}

// ============ RECRUITER APPLICATIONS ============
const queryKeyRecruiterApplications = ["recruiterApplications"];

export function useQueryRecruiterApplications({
    jobId,
    status = "all",
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyRecruiterApplications, { jobId, status }],
        queryFn: async () => {
            const { data } = await api.get("/api/profile/recruiter/dashboard/applications", {
                headers: getAuthHeader(),
                params: {
                    jobId: jobId || undefined,
                    status: status !== "all" ? status : undefined,
                },
                withCredentials: true,
            });

            // Note: Dashboard endpoint structure might differ from standard list
            // Based on page usage: data.applications, data.stats, data.jobs
            return {
                applications: data.applications || [],
                stats: data.stats, // stats might be here
                jobs: data.jobs || [], // useful for filtering
            };
        },
        enabled,
    });
}

// ============ UPDATE APPLICATION STATUS ============
export function useMutationUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ applicationId, status, notes }) => {
            // Use api for PATCH (CSRF protected)
            const { data } = await api.patch(
                `/api/profile/recruiter/applications/${applicationId}`,
                { status, notes },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui status");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterApplications });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard });
        },
    });
}

// ============ RECRUITER INTERVIEWS ============
const queryKeyRecruiterInterviews = ["recruiterInterviews"];

export function useQueryRecruiterInterviews({
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: queryKeyRecruiterInterviews,
        queryFn: async () => {
            // Updated to match dashboard usage
            const { data } = await api.get("/api/profile/recruiter/interviews/list", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat daftar interview");

            return {
                interviews: data.data.interviews || [],
                stats: data.data.stats,
            };
        },
        enabled,
    });
}

// ============ SCHEDULE INTERVIEW ============
export function useMutationScheduleInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (interviewData) => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post(
                "/api/profile/recruiter/interviews",
                interviewData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal menjadwalkan interview");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterInterviews });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterApplications });
        },
    });
}

// ============ UPDATE INTERVIEW PARTICIPANT (RESCHEDULE ETC) ============
export function useMutationUpdateInterviewParticipant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ interviewId, participantId, data: updateData }) => {
            const { data } = await api.patch(
                `/api/profile/recruiter/interviews/${interviewId}/participants/${participantId}`,
                updateData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui status kandidat");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterInterviews });
        },
    });
}

// ============ DELETE INTERVIEW ============
export function useMutationDeleteInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (interviewId) => {
            const { data } = await api.delete(
                `/api/profile/recruiter/interviews/${interviewId}`,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal menghapus interview");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterInterviews });
        },
    });
}

// ============ HIRED EMPLOYEES ============
const queryKeyHiredEmployees = ["hiredEmployees"];

export function useQueryHiredEmployees(enabled = true) {
    return useQuery({
        queryKey: queryKeyHiredEmployees,
        queryFn: async () => {
            const { data } = await api.get("/api/profile/recruiter/hired", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat data karyawan");

            return data.data;
        },
        enabled,
    });
}

// ============ SAVE RECRUITER PROFILE ============
export function useMutationSaveRecruiterProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profileData) => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post(
                "/api/profile/recruiter",
                profileData,
                { headers: { ...getAuthHeader(), "Content-Type": "application/json" }, withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal menyimpan profil");

            return data;
        },
        onSuccess: async () => {
            // Await both invalidations to ensure cache is properly updated before navigation
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeyRecruiterProfile }),
                queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard }),
            ]);
        },
    });
}

// ============ SUBMIT COMPANY FOR VERIFICATION ============
export function useMutationSubmitForVerification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post(
                "/api/profile/recruiter/submit-validation",
                {},
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal mengajukan verifikasi");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterProfile });
        },
    });
}

// ============ POST JOB ============
export function useMutationPostJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobData) => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post(
                "/api/profile/recruiter/jobs/create",
                jobData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memposting lowongan");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterJobs });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard });
        },
    });
}

// ============ UPDATE JOB ============
export function useMutationUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ slug, jobId, jobData }) => {
            // Use api for PUT (CSRF protected)
            const { data } = await api.put(
                `/api/profile/recruiter/jobs/${slug || jobId}/update`,
                jobData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui lowongan");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterJobs });
        },
    });
}

// ============ TOGGLE JOB STATUS ============
export function useMutationToggleJobStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ slug, applicationDeadline }) => {
            const { data } = await api.post(
                `/api/profile/recruiter/jobs/${slug}/toggle-status`,
                { applicationDeadline },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal mengubah status lowongan");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterJobs });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard });
        },
    });
}

// ============ DELETE JOB ============
export function useMutationDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slug) => {
            const { data } = await api.delete(
                `/api/profile/recruiter/jobs/${slug}`,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal menghapus lowongan");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterJobs });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard });
        },
    });
}
