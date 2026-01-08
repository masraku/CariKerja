"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Settings,
  LogOut,
  CheckCircle,
  FileText,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingCounts, setPendingCounts] = useState({
    companies: 0,
    jobs: 0,
    contracts: 0,
  });

  // Fetch pending counts for notifications
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch pending companies count
        const companiesRes = await fetch("/api/admin/companies/pending-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch pending jobs count
        const jobsRes = await fetch("/api/admin/jobs/pending-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch pending contracts count
        const contractsRes = await fetch("/api/admin/contracts/pending-count", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setPendingCounts((prev) => ({
            ...prev,
            companies: companiesData.count || 0,
          }));
        }

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setPendingCounts((prev) => ({ ...prev, jobs: jobsData.count || 0 }));
        }

        if (contractsRes.ok) {
          const contractsData = await contractsRes.json();
          setPendingCounts((prev) => ({
            ...prev,
            contracts: contractsData.count || 0,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch pending counts:", error);
      }
    };

    fetchPendingCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    {
      icon: Building2,
      label: "Perusahaan",
      href: "/admin/companies",
      showBullet: pendingCounts.companies > 0,
    },
    { icon: Users, label: "Pencari Kerja", href: "/admin/jobseekers" },
    {
      icon: Briefcase,
      label: "Lowongan",
      href: "/admin/jobs",
      showBullet: pendingCounts.jobs > 0,
    },
    {
      icon: FileText,
      label: "Pendaftaran Kontrak",
      href: "/admin/contracts",
      showBullet: pendingCounts.contracts > 0,
    },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-white text-[#03587f] flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#03587f] rounded-lg flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg text-[#03587f]">Panel Admin</div>
            <div className="text-xs text-gray-500">Disnaker Cirebon</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" &&
                pathname.startsWith(item.href) &&
                (pathname === item.href ||
                  pathname.charAt(item.href.length) === "/"));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#03587f] text-white shadow-md"
                      : "text-[#03587f] hover:bg-[#03587f]/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.showBullet && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}
