"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Settings,
  LogOut,
  CheckCircle,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    {
      icon: Building2,
      label: "Perusahaan",
      href: "/admin/companies",
      badge: "pending",
    },
    { icon: Users, label: "Pencari Kerja", href: "/admin/jobseekers" },
    { icon: Briefcase, label: "Lowongan", href: "/admin/jobs" },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-white text-[#03587f] flex flex-col h-screen border-r-2 border-[#03587f]">
      {/* Logo */}
      <div className="p-6 border-b-2 border-[#03587f]">
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
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      Baru
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t-2 border-[#03587f]">
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
