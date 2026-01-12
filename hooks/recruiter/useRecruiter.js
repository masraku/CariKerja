import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Helper to get auth header
const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ============ RECRUITER DASHBOARD ============
const queryKeyRecruiterDashboard = ["recruiterDashboard"];

export function useQueryRecruiterDashboard(enabled = true) {
    return useQuery({
        queryKey: queryKeyRecruiterDashboard,
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/recruiter/dashboard", {
                headers: getAuthHeader(),
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
            const { data } = await axios.get("/api/profile/recruiter", {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat profil");

            return data.profile;
        },
        enabled,
    });
}

// ============ RECRUITER JOBS ============
const queryKeyRecruiterJobs = ["recruiterJobs"];

export function useQueryRecruiterJobs({
    status = "all",
    page = 1,
    limit = 10,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyRecruiterJobs, { status, page, limit }],
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/recruiter/jobs", {
                headers: getAuthHeader(),
                params: {
                    status: status !== "all" ? status : undefined,
                    page,
                    limit,
                },
            });

            if (!data.success) throw new Error("Gagal memuat daftar lowongan");

            return {
                jobs: data.data.jobs || [],
                pagination: data.data.pagination,
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
    page = 1,
    limit = 20,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyRecruiterApplications, { jobId, status, page, limit }],
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/recruiter/applications", {
                headers: getAuthHeader(),
                params: {
                    jobId: jobId || undefined,
                    status: status !== "all" ? status : undefined,
                    page,
                    limit,
                },
            });

            if (!data.success) throw new Error("Gagal memuat daftar lamaran");

            return {
                applications: data.data.applications || [],
                pagination: data.data.pagination,
                stats: data.data.stats,
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
            const { data } = await axios.patch(
                `/api/applications/${applicationId}`,
                { status, notes },
                { headers: getAuthHeader() }
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
    status = "all",
    page = 1,
    limit = 20,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyRecruiterInterviews, { status, page, limit }],
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/recruiter/interviews", {
                headers: getAuthHeader(),
                params: {
                    status: status !== "all" ? status : undefined,
                    page,
                    limit,
                },
            });

            if (!data.success) throw new Error("Gagal memuat daftar interview");

            return {
                interviews: data.data.interviews || data.data || [],
                pagination: data.data.pagination,
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
            const { data } = await axios.post(
                "/api/interviews",
                interviewData,
                { headers: getAuthHeader() }
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

// ============ HIRED EMPLOYEES ============
const queryKeyHiredEmployees = ["hiredEmployees"];

export function useQueryHiredEmployees(enabled = true) {
    return useQuery({
        queryKey: queryKeyHiredEmployees,
        queryFn: async () => {
            const { data } = await axios.get("/api/profile/recruiter/hired", {
                headers: getAuthHeader(),
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
            const { data } = await axios.post(
                "/api/profile/recruiter",
                profileData,
                { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
            );

            if (!data.success) throw new Error(data.error || "Gagal menyimpan profil");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterProfile });
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterDashboard });
        },
    });
}

// ============ SUBMIT COMPANY FOR VERIFICATION ============
export function useMutationSubmitForVerification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await axios.post(
                "/api/profile/recruiter/submit-verification",
                {},
                { headers: getAuthHeader() }
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
            const { data } = await axios.post(
                "/api/jobs",
                jobData,
                { headers: getAuthHeader() }
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
        mutationFn: async ({ jobId, jobData }) => {
            const { data } = await axios.put(
                `/api/jobs/${jobId}`,
                jobData,
                { headers: getAuthHeader() }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui lowongan");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyRecruiterJobs });
        },
    });
}
