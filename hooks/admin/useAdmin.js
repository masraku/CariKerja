import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/api"; // CSRF-protected axios instance

const getAuthHeader = () => ({});

// ============ ADMIN DASHBOARD STATS ============
const queryKeyAdminStats = ["adminStats"];
const queryKeyAdminChartStats = ["adminChartStats"];

export function useQueryAdminStats(enabled = true) {
    return useQuery({
        queryKey: queryKeyAdminStats,
        queryFn: async () => {
            const [jobseekersRes, companiesRes] = await Promise.all([
                axios.get("/api/admin/jobseekers/stats", {
                    headers: getAuthHeader(),
                }),
                axios.get("/api/admin/companies?status=pending", {
                    headers: getAuthHeader(),
                }),
            ]);

            if (!jobseekersRes.data.success || !companiesRes.data.success) {
                throw new Error("Gagal memuat statistik");
            }

            return {
                jobseekers: jobseekersRes.data.data,
                pendingCompanies: companiesRes.data.data.count,
            };
        },
        enabled,
    });
}

export function useQueryAdminChartStats(enabled = true) {
    return useQuery({
        queryKey: queryKeyAdminChartStats,
        queryFn: async () => {
            const { data } = await axios.get("/api/admin/chart-stats", {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat statistik chart");

            return data.data;
        },
        enabled,
    });
}

// ============ ADMIN COMPANIES ============
const queryKeyAdminCompanies = ["adminCompanies"];

export function useQueryAdminCompanies({
    search = "",
    status = "all",
    page = 1,
    limit = 10,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyAdminCompanies, { search, status, page, limit }],
        queryFn: async () => {
            const { data } = await axios.get("/api/admin/companies", {
                headers: getAuthHeader(),
                params: {
                    search: search || undefined,
                    status: status !== "all" ? status : undefined,
                    page,
                    limit,
                },
            });

            if (!data.success) throw new Error("Gagal memuat daftar perusahaan");

            return {
                companies: data.data?.companies || [],
                pagination: data.pagination,
            };
        },
        enabled,
    });
}

// ============ VERIFY COMPANY ============
export function useMutationVerifyCompany() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ companyId, verified }) => {
            // Use api for PATCH (CSRF protected)
            const { data } = await api.patch(
                `/api/admin/companies/${companyId}`,
                { verified },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memverifikasi");

            return data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeyAdminCompanies }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminStats }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminSidebarCounts }),
            ]);
        },
    });
}

// ============ ADMIN JOBS ============
const queryKeyAdminJobs = ["adminJobs"];

export function useQueryAdminJobs({
    search = "",
    status = "all",
    jobType = "all",
    kecamatan = "all",
    scope = "all",
    sort = "newest",
    page = 1,
    limit = 10,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyAdminJobs, { search, status, jobType, kecamatan, scope, sort, page, limit }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (status !== "all") params.append("status", status);
            if (jobType !== "all") params.append("jobType", jobType);
            if (kecamatan !== "all") params.append("kecamatan", kecamatan);
            if (scope !== "all") params.append("scope", scope);
            params.append("sort", sort);

            const { data } = await axios.get(`/api/admin/jobs?${params.toString()}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat daftar lowongan");

            return {
                jobs: data.jobs || [],
                stats: data.stats || null,
            };
        },
        enabled,
    });
}

export function useMutationUpdateJobStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, status, rejectionReason }) => {
            // Use api for PATCH (CSRF protected)
            const { data } = await api.patch(
                "/api/admin/jobs",
                { jobId, status, rejectionReason },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui status");

            return data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeyAdminJobs }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminStats }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminChartStats }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminSidebarCounts }),
            ]);
        },
    });
}

// ============ ADMIN JOBSEEKERS ============
const queryKeyAdminJobseekers = ["adminJobseekers"];

export function useQueryAdminJobseekers({
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: queryKeyAdminJobseekers,
        queryFn: async () => {
            const { data } = await axios.get("/api/admin/jobseekers", {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat daftar pencari kerja");

            return data.data?.jobseekers || [];
        },
        enabled,
    });
}

// ============ ADMIN CONTRACTS ============
const queryKeyAdminContracts = ["adminContracts"];

export function useQueryAdminContracts({
    status = "PENDING",
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyAdminContracts, { status }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (status !== "all") {
                params.append("status", status);
            }

            const { data } = await axios.get(`/api/admin/contracts?${params}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat daftar kontrak");

            return {
                contracts: data.contracts || [],
                stats: data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 },
            };
        },
        enabled,
    });
}

export function useMutationProcessContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, action, adminNotes, adminResponseDocUrl }) => {
            // Use api for PATCH (CSRF protected)
            const { data } = await api.patch(
                `/api/admin/contracts/${id}`,
                { action, adminNotes, adminResponseDocUrl },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memproses kontrak");

            return data;
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeyAdminContracts }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminStats }),
                queryClient.invalidateQueries({ queryKey: queryKeyAdminSidebarCounts }),
            ]);
        },
    });
}

// ============ ADMIN NEWS ============
const queryKeyAdminNews = ["adminNews"];

export function useQueryAdminNews({
    search = "",
    status = "all",
    category = "all",
    sort = "newest",
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyAdminNews, { search, status, category, sort }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (status !== "all") params.append("status", status);
            if (category !== "all") params.append("category", category);
            params.append("sort", sort);

            const { data } = await axios.get(`/api/admin/news?${params.toString()}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Gagal memuat daftar berita");

            return {
                news: data.news || [],
                stats: data.stats || null,
                categories: data.categories || [],
            };
        },
        enabled,
    });
}

// ============ CREATE/UPDATE NEWS ============
export function useMutationCreateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newsData) => {
            // Use api for POST (CSRF protected)
            const { data } = await api.post(
                "/api/admin/news",
                newsData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal membuat berita");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyAdminNews });
        },
    });
}

export function useMutationUpdateNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ newsId, newsData }) => {
            // Use api for PUT (CSRF protected)
            const { data } = await api.put(
                `/api/admin/news/${newsId}`,
                newsData,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal memperbarui berita");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyAdminNews });
        },
    });
}

export function useMutationDeleteNews() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newsId) => {
            // Use api for DELETE (CSRF protected)
            const { data } = await api.delete(
                `/api/admin/news/${newsId}`,
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal menghapus berita");

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyAdminNews });
        },
    });
}

// ============ ADMIN SIDEBAR PENDING COUNTS ============
const queryKeyAdminSidebarCounts = ["adminSidebarCounts"];

export function useQueryAdminSidebarCounts(enabled = true) {
    return useQuery({
        queryKey: queryKeyAdminSidebarCounts,
        queryFn: async () => {
            const [companiesRes, jobsRes, contractsRes] = await Promise.allSettled([
                axios.get("/api/admin/companies/pending-count", { headers: getAuthHeader() }),
                axios.get("/api/admin/jobs/pending-count", { headers: getAuthHeader() }),
                axios.get("/api/admin/contracts/pending-count", { headers: getAuthHeader() }),
            ]);

            return {
                companies: companiesRes.status === "fulfilled"
                    ? companiesRes.value.data.count || 0 : 0,
                jobs: jobsRes.status === "fulfilled"
                    ? jobsRes.value.data.count || 0 : 0,
                contracts: contractsRes.status === "fulfilled"
                    ? contractsRes.value.data.count || 0 : 0,
            };
        },
        enabled,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}
