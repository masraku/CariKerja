"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  Activity,
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    action: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [availableActions, setAvailableActions] = useState([]);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (filters.action) params.append("action", filters.action);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
        setAvailableActions(data.filters?.actions || []);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    fetchLogs(1);
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (filters.action) params.append("action", filters.action);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    window.open(`/api/admin/audit-logs/export?${params}`, "_blank");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionColor = (action) => {
    if (action.includes("LOGIN")) return "bg-blue-100 text-blue-700";
    if (action.includes("VERIFY") || action.includes("APPROVE"))
      return "bg-green-100 text-green-700";
    if (action.includes("REJECT")) return "bg-red-100 text-red-700";
    if (action.includes("CREATE")) return "bg-purple-100 text-purple-700";
    if (action.includes("UPDATE")) return "bg-amber-100 text-amber-700";
    if (action.includes("DELETE") || action.includes("TERMINATE"))
      return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Audit Logs
              </h1>
              <p className="text-slate-300 mt-1">
                Monitor semua aktivitas penting di sistem
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cari
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari action, IP..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) =>
                  setFilters({ ...filters, action: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua</option>
                {availableActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="min-w-[150px]">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleFilter}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <button
              onClick={() => {
                setFilters({
                  action: "",
                  startDate: "",
                  endDate: "",
                  search: "",
                });
                fetchLogs(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-slate-500 mb-4">
          Total:{" "}
          <span className="font-semibold text-slate-700">
            {pagination.total}
          </span>{" "}
          logs
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Tidak ada log ditemukan
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.userId ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">
                              {log.userRole || "USER"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {log.targetType ? (
                          <span className="text-slate-700">
                            {log.targetType}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">
                        {log.changes ? JSON.stringify(log.changes) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Halaman {pagination.page} dari {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
