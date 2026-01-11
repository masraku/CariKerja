import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ============ COMPANIES LIST ============
const queryKeyCompanies = ["companies"];

export function useQueryCompanies({
    search = "",
    industry = "all",
    size = "all",
    enabled = true,
} = {}) {
    return useQuery({
        queryKey: [...queryKeyCompanies, { search, industry, size }],
        queryFn: async () => {
            const { data } = await axios.get("/api/companies", {
                params: {
                    search: search || undefined,
                    industry: industry !== "all" ? industry : undefined,
                    size: size !== "all" ? size : undefined,
                },
            });

            return {
                companies: data.companies || [],
                industries: [
                    "all",
                    ...new Set(
                        (data.companies || [])
                            .map((c) => c.industry)
                            .filter((i) => i && i !== "Belum dilengkapi")
                    ),
                ],
            };
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// ============ COMPANY DETAIL ============
const queryKeyCompanyDetail = ["companyDetail"];

export function useQueryCompanyDetail(slug, enabled = true) {
    return useQuery({
        queryKey: [...queryKeyCompanyDetail, slug],
        queryFn: async () => {
            if (!slug) throw new Error("No slug provided");

            const { data } = await axios.get(`/api/companies/${slug}`);

            if (!data.success) throw new Error("Failed to fetch company detail");

            return data.data;
        },
        enabled: enabled && !!slug,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
