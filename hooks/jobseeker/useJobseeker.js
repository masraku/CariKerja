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

            if (!data.success) throw new Error("Failed to fetch applications");

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
            if (!id) throw new Error("No application ID");

            const { data } = await axios.get(`/api/applications/${id}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Failed to fetch application detail");

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

            if (!data.success) throw new Error(data.error || "Failed to withdraw");

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

            if (!data.success) throw new Error("Failed to fetch interviews");

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
            if (!id) throw new Error("No interview ID");

            const { data } = await axios.get(`/api/interviews/${id}`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error("Failed to fetch interview");

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
            if (!id) throw new Error("No interview ID");

            const { data } = await axios.get(`/api/interviews/${id}/room`, {
                headers: getAuthHeader(),
            });

            if (!data.success) throw new Error(data.error || "Failed to fetch interview room");

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
