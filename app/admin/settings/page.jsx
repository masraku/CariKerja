"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [profileData, setProfileData] = useState({
    name: "Administrator",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newCompanyAlert: true,
    newContractAlert: true,
    weeklyReport: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    autoApproveJobs: false,
    maxUploadSize: "10",
  });

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Keamanan", icon: Shield },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "system", label: "Sistem", icon: Database },
  ];

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/settings");
      const settings = response.data.settings;

      if (settings) {
        setNotificationSettings({
          emailNotifications: settings.emailNotifications ?? true,
          newCompanyAlert: settings.newCompanyAlert ?? true,
          newContractAlert: settings.newContractAlert ?? true,
          weeklyReport: settings.weeklyReport ?? false,
        });
        setSystemSettings({
          maintenanceMode: settings.maintenanceMode ?? false,
          allowRegistration: settings.allowRegistration ?? true,
          autoApproveJobs: settings.autoApproveJobs ?? false,
          maxUploadSize: String(settings.maxUploadSize ?? 10),
        });
      }

      // Get user info from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.email) {
        setProfileData({
          name: "Administrator",
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put(
        "/api/admin/settings/profile",
        profileData,
      );

      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.email = profileData.email;
      localStorage.setItem("user", JSON.stringify(user));

      showSuccess(response.data.message || "Profil berhasil diperbarui");
    } catch (error) {
      showError("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Password baru tidak cocok");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showError("Password minimal 8 karakter");
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(
        "/api/admin/settings/password",
        passwordData,
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showSuccess(response.data.message || "Password berhasil diubah");
    } catch (error) {
      showError("Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const response = await api.put(
        "/api/admin/settings",
        notificationSettings,
      );
      showSuccess(
        response.data.message || "Pengaturan notifikasi berhasil disimpan",
      );
    } catch (error) {
      showError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    try {
      const response = await api.put("/api/admin/settings", {
        ...systemSettings,
        maxUploadSize: parseInt(systemSettings.maxUploadSize),
      });
      showSuccess(
        response.data.message || "Pengaturan sistem berhasil disimpan",
      );
    } catch (error) {
      showError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#03587f] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-white" />
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              Pengaturan
            </h1>
          </div>
          <p className="text-slate-300">
            Kelola pengaturan sistem dan akun Anda
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}
      {errorMessage && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? "bg-[#03587f] text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-1">
                      Profil Admin
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Perbarui informasi profil akun Anda
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent transition"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#03587f] text-white rounded-lg hover:bg-[#024a6b] disabled:opacity-50 transition"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Simpan Profil
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-1">
                      Keamanan Akun
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Ubah password untuk keamanan akun
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Password Baru
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#03587f] focus:border-transparent transition"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={
                        saving ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword
                      }
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#03587f] text-white rounded-lg hover:bg-[#024a6b] disabled:opacity-50 transition"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Ubah Password
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-1">
                      Pengaturan Notifikasi
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Kelola preferensi notifikasi email
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Aktifkan Notifikasi Email",
                        desc: "Terima notifikasi melalui email",
                      },
                      {
                        key: "newCompanyAlert",
                        label: "Perusahaan Baru",
                        desc: "Notifikasi saat ada perusahaan baru mendaftar",
                      },
                      {
                        key: "newContractAlert",
                        label: "Kontrak Baru",
                        desc: "Notifikasi saat ada pendaftaran kontrak baru",
                      },
                      {
                        key: "weeklyReport",
                        label: "Laporan Mingguan",
                        desc: "Terima ringkasan aktivitas mingguan",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-slate-700">
                            {item.label}
                          </div>
                          <div className="text-sm text-slate-500">
                            {item.desc}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.key]}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#03587f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#03587f]"></div>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={handleSaveNotifications}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#03587f] text-white rounded-lg hover:bg-[#024a6b] disabled:opacity-50 transition"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Simpan Pengaturan
                    </button>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === "system" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-1">
                      Pengaturan Sistem
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Konfigurasi sistem aplikasi
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "maintenanceMode",
                        label: "Mode Pemeliharaan",
                        desc: "Nonaktifkan akses publik sementara",
                        warning: true,
                      },
                      {
                        key: "allowRegistration",
                        label: "Izinkan Pendaftaran",
                        desc: "Pengguna baru dapat mendaftar",
                      },
                      {
                        key: "autoApproveJobs",
                        label: "Auto-Approve Lowongan",
                        desc: "Lowongan baru langsung aktif tanpa review",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className={`flex items-center justify-between p-4 rounded-lg ${item.warning && systemSettings[item.key] ? "bg-amber-50 border border-amber-200" : "bg-slate-50"}`}
                      >
                        <div>
                          <div className="font-medium text-slate-700">
                            {item.label}
                          </div>
                          <div className="text-sm text-slate-500">
                            {item.desc}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={systemSettings[item.key]}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                [item.key]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div
                            className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#03587f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${item.warning ? "bg-slate-200 peer-checked:bg-amber-500" : "bg-slate-200 peer-checked:bg-[#03587f]"}`}
                          ></div>
                        </label>
                      </div>
                    ))}

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-700">
                            Ukuran Upload Maksimal
                          </div>
                          <div className="text-sm text-slate-500">
                            Batas ukuran file yang dapat diupload
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={systemSettings.maxUploadSize}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                maxUploadSize: e.target.value,
                              })
                            }
                            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-[#03587f] focus:border-transparent"
                          />
                          <span className="text-slate-600">MB</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSystem}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#03587f] text-white rounded-lg hover:bg-[#024a6b] disabled:opacity-50 transition"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Simpan Pengaturan
                    </button>
                  </div>

                  {/* System Info */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-medium text-slate-700 mb-4">
                      Informasi Sistem
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500">Versi Aplikasi</div>
                        <div className="font-medium text-slate-700">1.0.0</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500">Framework</div>
                        <div className="font-medium text-slate-700">
                          Next.js 15
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500">Database</div>
                        <div className="font-medium text-slate-700">
                          PostgreSQL
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-slate-500">Environment</div>
                        <div className="font-medium text-slate-700">
                          {process.env.NODE_ENV}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
