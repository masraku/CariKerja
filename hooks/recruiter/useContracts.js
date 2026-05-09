import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const getAuthHeader = () => ({});

// ============ ACCEPTED APPLICANTS ============
const queryKeyAcceptedApplicants = ["recruiterAcceptedApplicants"];

export function useQueryAcceptedApplicants({ enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeyAcceptedApplicants,
        queryFn: async () => {
            const { data } = await api.get("/api/contracts/accepted-applicants", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat data pelamar diterima");

            return {
                acceptedApplicants: data.acceptedApplicants || [],
                stats: data.stats || {},
            };
        },
        enabled,
    });
}

// ============ CONTRACT LISTS ============
const queryKeyContracts = ["recruiterContracts"];

export function useQueryContracts({ enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeyContracts,
        queryFn: async () => {
            const { data } = await api.get("/api/contracts", {
                headers: getAuthHeader(),
                withCredentials: true,
            });

            if (!data.success) throw new Error("Gagal memuat data kontrak");

            return {
                pendingContracts: data.pendingContracts || [],
                rejectedContracts: data.rejectedContracts || [],
                approvedContracts: data.approvedContracts || [],
            };
        },
        enabled,
    });
}

// ============ CREATE CONTRACT ============
export function useMutationCreateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workers, recruiterDocUrl }) => {
            const { data } = await api.post(
                "/api/contracts",
                { workers, recruiterDocUrl },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal mendaftarkan kontrak");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyAcceptedApplicants });
            queryClient.invalidateQueries({ queryKey: queryKeyContracts });
        },
    });
}

// ============ TERMINATE CONTRACT ============
export function useMutationTerminateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workerId, reason }) => {
            const { data } = await api.post(
                "/api/contracts/terminate",
                { workerId, reason },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal mengakhiri kontrak");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyContracts });
        },
    });
}

// ============ RESUBMIT CONTRACT ============
export function useMutationResubmitContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contractId) => {
            const { data } = await api.post(
                "/api/contracts/resubmit",
                { contractId },
                { headers: getAuthHeader(), withCredentials: true }
            );

            if (!data.success) throw new Error(data.error || "Gagal melakukan resubmit");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeyContracts });
        },
    });
}

// ============ UPLOAD CONTRACT DOCUMENT ============
export function useMutationUploadContractDoc() {
    return useMutation({
        mutationFn: async (file) => {
            if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran file terlalu besar. Maksimal 2MB.");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "contract-doc");
            formData.append("bucket", "Lowongan");
            formData.append("folder", "contracts");

            const { data } = await api.post("/api/upload", formData, {
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            if (!data.success) throw new Error(data.error || "Gagal mengupload lampiran");
            return data.url;
        },
    });
}
