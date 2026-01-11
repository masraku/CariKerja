import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ============ NEWS LIST ============
const queryKeyNews = ["news"];

export function useQueryNews({
    search = "",
    category = "all",
    page = 1,
    limit = 6,
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyNews, { search, category, page, limit }],
        queryFn: async () => {
            const { data } = await axios.get("/api/news", {
                params: {
                    search: search || undefined,
                    category: category !== "all" ? category : undefined,
                    page,
                    limit,
                },
            });

            if (!data.success) throw new Error("Failed to fetch news");

            return {
                news: data.news || [],
                categories: data.categories || [],
                pagination: {
                    total: data.pagination?.total || 0,
                    totalPages: data.pagination?.totalPages || 0,
                    page,
                    limit,
                },
            };
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// ============ NEWS DETAIL ============
const queryKeyNewsDetail = ["newsDetail"];

export function useQueryNewsDetail(slug, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyNewsDetail, slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided");

            const { data } = await axios.get(`/api/news/${slug}`);

            if (!data.success) throw new Error("Failed to fetch news detail");

            return data.data;
        },
        enabled: enabled && !!slug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
