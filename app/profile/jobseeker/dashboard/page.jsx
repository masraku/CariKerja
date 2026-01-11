"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  User,
  Edit,
  Search,
  ArrowRight,
  View,
  Sparkles,
  Award,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  useQueryGetProfile,
  useQueryDashboardStats,
  useQueryEmploymentStatus,
  useMutationEmploymentStatus,
} from "@/hooks/dashboard/getProfile";

const JobseekerDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Status label helper - konsisten dengan recruiter dalam bahasa Indonesia
  const getStatusLabel = (status) => {
    const statusConfig = {
      PENDING: { label: "Menunggu", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
      REVIEWING: { label: "Sedang Ditinjau", color: "bg-blue-50 text-blue-700 border-blue-100" },
      SHORTLISTED: { label: "Lolos Seleksi", color: "bg-purple-50 text-purple-700 border-purple-100" },
      INTERVIEW_SCHEDULED: { label: "Tahap Interview", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
      INTERVIEW_COMPLETED: { label: "Selesai Interview", color: "bg-cyan-50 text-cyan-700 border-cyan-100" },
      ACCEPTED: { label: "Diterima", color: "bg-green-50 text-green-600 border-green-100" },
      REJECTED: { label: "Ditolak", color: "bg-red-50 text-red-600 border-red-100" },
      WITHDRAWN: { label: "Ditarik", color: "bg-gray-50 text-gray-600 border-gray-100" },
      RESIGNED: { label: "Mengundurkan Diri", color: "bg-orange-50 text-orange-700 border-orange-100" },
    };
    return statusConfig[status] || { label: status, color: "bg-gray-50 text-gray-600 border-gray-100" };
  };

  // Profile Query
  const {
    data: profileData,
    isError: isErrorGetProfile,
    isPending: isPendingGetProfile,
  } = useQueryGetProfile();

  const profile = profileData?.profile;
  const isProfileComplete = profile?.profileCompleted;

  // Dashboard Stats Query - only fetch when profile is complete
  const {
    data: statsData,
    isPending: isPendingStats,
  } = useQueryDashboardStats(isProfileComplete);

  // Employment Status Query - only fetch when profile is complete
  const {
    data: employmentStatus,
    isPending: isPendingEmployment,
  } = useQueryEmploymentStatus(isProfileComplete);

  // Employment Status Mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutationEmploymentStatus();

  // Redirect logic
  useEffect(() => {
    if (!isPendingGetProfile) {
      if (isErrorGetProfile || !profile) {
        router.push("/profile/jobseeker?mode=edit");
      } else if (!isProfileComplete) {
        router.push("/profile/jobseeker?mode=edit");
      }
    }
  }, [isPendingGetProfile, isErrorGetProfile, profile, isProfileComplete, router]);

  const handleUpdateEmploymentStatus = async (field, value) => {
    const updateData = { [field]: value };

    // If setting employed to true, ask for company name
    if (field === "isEmployed" && value === true) {
      const { value: companyName } = await Swal.fire({
        title: "Selamat! 🎉",
        text: "Dimana Anda bekerja sekarang?",
        input: "text",
        inputPlaceholder: "Nama Perusahaan",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Simpan",
      });

      if (!companyName) return;
      updateData.employedCompany = companyName;
    }

    updateStatus(updateData, {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Status Diperbarui",
          timer: 1500,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
        });
      },
      onError: () => {
        Swal.fire({ icon: "error", text: "Gagal memperbarui status" });
      },
    });
  };

  // Loading state
  if (isPendingGetProfile || (isProfileComplete && (isPendingStats || isPendingEmployment))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // Default values
  const stats = statsData || { totalApplications: 0, pending: 0, interview: 0, accepted: 0 };
  const recentApplications = statsData?.recentApplications || [];
  const currentEmploymentStatus = employmentStatus || {
    isEmployed: false,
    isLookingForJob: true,
    employedCompany: "",
    employedAt: null,
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#03587f] via-[#046a96] to-[#024666] rounded-3xl p-6 md:p-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden mb-8">
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white p-1 rounded-full shadow-lg">
                  {profile?.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.firstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                      {profile?.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push("/profile/jobseeker?mode=edit")}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-400 transition border-2 border-white"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="text-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Hai, {profile?.firstName}! 👋
                  </h1>
                  {/* Employment Status Badge */}
                  {currentEmploymentStatus.isEmployed ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/90 text-white shadow-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sudah Bekerja
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-400/80 text-white shadow-lg">
                      <Search className="w-3.5 h-3.5" />
                      Mencari Kerja
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-sm md:text-base mt-1">
                  {currentEmploymentStatus.isEmployed
                    ? `Bekerja di ${currentEmploymentStatus.employedCompany}`
                    : profile?.currentTitle || "Siap menjemput karir impian?"}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    <MapPin className="w-3 h-3" />{" "}
                    {profile?.city || "Belum diatur"}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${profile?.profileCompleteness === 100
                      ? "bg-green-500/20 text-green-200"
                      : "bg-yellow-500/20 text-yellow-200"
                      }`}
                  >
                    <Award className="w-3 h-3" /> Profile:{" "}
                    {profile?.profileCompleteness}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/profile/jobseeker/view")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl transition flex items-center gap-2 font-medium text-sm"
            >
              <View className="w-4 h-4" />
              Lihat Profile Publik
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" /> Statistik Lamaran
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-100 border border-gray-50 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.totalApplications}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Total Lamaran
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-100 border border-gray-50 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-500 font-medium">Menunggu</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-100 border border-gray-50 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.interview}
            </div>
            <div className="text-sm text-gray-500 font-medium">Interview</div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg shadow-gray-100 border border-gray-50 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats.accepted}
            </div>
            <div className="text-sm text-gray-500 font-medium">Diterima</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Lamaran Terbaru
              </h2>
              <button
                onClick={() => router.push("/profile/jobseeker/applications")}
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() =>
                      router.push("/profile/jobseeker/applications")
                    }
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        {app.jobs.companies.logo ? (
                          <img
                            src={app.jobs.companies.logo}
                            alt={app.jobs.companies.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">
                            {app.jobs.companies.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition truncate pr-2">
                              {app.jobs.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">
                                {app.jobs.companies.name}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {app.jobs.companies.city}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusLabel(app.status).color}`}
                          >
                            {getStatusLabel(app.status).label}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                          <span>
                            Dilamar:{" "}
                            {new Date(app.appliedAt).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "long", year: "numeric" }
                            )}
                          </span>
                          <div className="flex items-center gap-1 group-hover:translate-x-1 transition text-blue-500 opacity-0 group-hover:opacity-100 font-semibold">
                            Detail Lamaran <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Belum ada lamaran
                </h3>
                <p className="text-gray-500 mb-6">
                  Mulai karir Anda dengan melamar pekerjaan yang sesuai.
                </p>
                <button
                  onClick={() => router.push("/jobs")}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                  Cari Lowongan
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Menu Cepat</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/jobs")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#03587f] to-[#024666] text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition group"
                >
                  <span className="font-semibold flex items-center gap-3">
                    <Search className="w-5 h-5" /> Cari Lowongan
                  </span>
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => router.push("/profile/jobseeker/applications")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition group"
                >
                  <span className="font-semibold flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />{" "}
                    Riwayat Lamaran
                  </span>
                </button>

                <button
                  onClick={() => router.push("/profile/jobseeker/view")}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition group"
                >
                  <span className="font-semibold flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition" />{" "}
                    Profile Saya
                  </span>
                </button>
              </div>
            </div>

            {/* Completion Tips */}
            {profile?.profileCompleteness < 100 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      Lengkapi Profil
                    </h4>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      Profil Anda baru{" "}
                      <span className="font-bold text-amber-600">
                        {profile.profileCompleteness}%
                      </span>
                      . Lengkapi untuk meningkatkan peluang dilirik rekruter.
                    </p>
                    <button
                      onClick={() =>
                        router.push("/profile/jobseeker?mode=edit")
                      }
                      className="text-xs font-bold text-amber-700 hover:underline"
                    >
                      Lengkapi Sekarang &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobseekerDashboard;

// Add custom animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
