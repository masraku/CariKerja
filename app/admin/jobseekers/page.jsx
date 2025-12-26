"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Eye,
  ChevronRight,
} from "lucide-react";
import {
  kecamatanCirebon,
  getAllKecamatan,
  getKelurahanByKecamatan,
} from "@/lib/cirebonData";

export default function AdminJobseekersPage() {
  const router = useRouter();
  const [jobseekers, setJobseekers] = useState([]);
  const [filteredJobseekers, setFilteredJobseekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [kelurahanFilter, setKelurahanFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    employed: 0,
    lookingForJob: 0,
    profileCompleted: 0,
  });

  // Get kelurahan options based on selected kecamatan
  const kelurahanOptions = kecamatanFilter
    ? getKelurahanByKecamatan(kecamatanFilter)
    : [];

  useEffect(() => {
    loadJobseekers();
  }, []);

  useEffect(() => {
    filterJobseekers();
  }, [jobseekers, searchQuery, statusFilter, kecamatanFilter, kelurahanFilter]);

  const loadJobseekers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/jobseekers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setJobseekers(data.data.jobseekers);
        calculateStats(data.data.jobseekers);
      }
    } catch (error) {
      console.error("Failed to load jobseekers:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      employed: data.filter((js) => js.isEmployed).length,
      lookingForJob: data.filter((js) => js.isLookingForJob).length,
      profileCompleted: data.filter((js) => js.profileCompleted).length,
    });
  };

  const filterJobseekers = () => {
    let filtered = [...jobseekers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (js) =>
          js.firstName?.toLowerCase().includes(query) ||
          js.lastName?.toLowerCase().includes(query) ||
          js.email?.toLowerCase().includes(query) ||
          js.city?.toLowerCase().includes(query) ||
          js.kecamatan?.toLowerCase().includes(query) ||
          js.kelurahan?.toLowerCase().includes(query) ||
          js.currentTitle?.toLowerCase().includes(query)
      );
    }

    if (statusFilter === "employed") {
      filtered = filtered.filter((js) => js.isEmployed);
    } else if (statusFilter === "unemployed") {
      filtered = filtered.filter((js) => !js.isEmployed);
    } else if (statusFilter === "looking") {
      filtered = filtered.filter((js) => js.isLookingForJob);
    } else if (statusFilter === "not-looking") {
      filtered = filtered.filter((js) => !js.isLookingForJob);
    }

    if (kecamatanFilter) {
      filtered = filtered.filter((js) => js.kecamatan === kecamatanFilter);
    }

    if (kelurahanFilter) {
      filtered = filtered.filter((js) => js.kelurahan === kelurahanFilter);
    }

    setFilteredJobseekers(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (js) => {
    if (js.isEmployed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          <UserCheck className="w-3.5 h-3.5" />
          Sudah Bekerja
        </span>
      );
    } else if (js.isLookingForJob) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
          Aktif Mencari Kerja
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
          <UserX className="w-3.5 h-3.5" />
          Tidak Aktif
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Manajemen Pencari Kerja
          </h1>
          <p className="text-slate-300 text-sm">
            Monitor dan kelola semua pencari kerja yang terdaftar di Kabupaten
            Cirebon
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-300 text-xs mt-1">
                Total Pencari Kerja
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-emerald-400">
                {stats.employed}
              </div>
              <div className="text-slate-300 text-xs mt-1">Sudah Bekerja</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-amber-400">
                {stats.lookingForJob}
              </div>
              <div className="text-slate-300 text-xs mt-1">Aktif Mencari</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">
                {stats.profileCompleted}
              </div>
              <div className="text-slate-300 text-xs mt-1">Profil Lengkap</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search & Status Filter Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, kecamatan, atau posisi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === "all"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatusFilter("employed")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === "employed"
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  Bekerja
                </button>
                <button
                  onClick={() => setStatusFilter("unemployed")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === "unemployed"
                      ? "bg-slate-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Belum Bekerja
                </button>
                <button
                  onClick={() => setStatusFilter("looking")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    statusFilter === "looking"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  }`}
                >
                  Aktif Cari
                </button>
              </div>
            </div>

            {/* Location Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Filter Kecamatan
                </label>
                <select
                  value={kecamatanFilter}
                  onChange={(e) => {
                    setKecamatanFilter(e.target.value);
                    setKelurahanFilter("");
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="">Semua Kecamatan</option>
                  {getAllKecamatan().map((kec) => (
                    <option key={kec} value={kec}>
                      {kec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Filter Kelurahan/Desa
                </label>
                <select
                  value={kelurahanFilter}
                  onChange={(e) => setKelurahanFilter(e.target.value)}
                  disabled={!kecamatanFilter}
                  className="w-full px-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:opacity-50"
                >
                  <option value="">Semua Kelurahan</option>
                  {kelurahanOptions.map((kel) => (
                    <option key={kel} value={kel}>
                      {kel}
                    </option>
                  ))}
                </select>
              </div>
              {(kecamatanFilter || kelurahanFilter) && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setKecamatanFilter("");
                      setKelurahanFilter("");
                    }}
                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                  >
                    Reset Lokasi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {loading ? "..." : filteredJobseekers.length}
            </span>{" "}
            dari {jobseekers.length} pencari kerja
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobseekers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Tidak ada data
            </h3>
            <p className="text-slate-500">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobseekers.map((js) => (
              <div
                key={js.id}
                onClick={() => router.push(`/admin/jobseekers/${js.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Photo & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {js.photo ? (
                      <img
                        src={js.photo}
                        alt={js.firstName}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {js.firstName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">
                        {js.firstName} {js.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {js.currentTitle || "Belum ada posisi"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {(js.kecamatan || js.kelurahan || js.city) && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {js.kelurahan && `${js.kelurahan}, `}
                            {js.kecamatan || js.city}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          {js.email}
                        </span>
                        {js.phone && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3.5 h-3.5" />
                            {js.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Stats */}
                  <div className="flex items-center gap-4 lg:gap-6">
                    {/* Status Badge */}
                    <div>{getStatusBadge(js)}</div>

                    {/* Application Count */}
                    <div className="text-center hidden md:block">
                      <div className="text-lg font-bold text-slate-800">
                        {js.totalApplications || 0}
                      </div>
                      <div className="text-xs text-slate-400">Lamaran</div>
                    </div>

                    {/* Join Date */}
                    <div className="hidden lg:block text-right">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(js.joinedAt)}
                      </div>
                      <div className="text-xs text-slate-400">Bergabung</div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
