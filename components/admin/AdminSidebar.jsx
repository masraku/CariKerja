"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryAdminSidebarCounts } from "@/hooks/admin/useAdmin";
import { IconBadge } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Settings,
  LogOut,
  CheckCircle,
  FileText,
  Newspaper,
  ClipboardList,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: pendingCounts = { companies: 0, jobs: 0, contracts: 0 } } =
    useQueryAdminSidebarCounts();

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
    { icon: Newspaper, label: "Berita", href: "/admin/news" },
    { icon: ClipboardList, label: "Audit Logs", href: "/admin/audit-logs" },
    { icon: Settings, label: "Pengaturan", href: "/admin/settings" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-card text-primary flex flex-col h-screen border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <IconBadge icon={CheckCircle} className="bg-primary text-primary-foreground border-primary" />
          <div>
            <div className="font-bold text-lg text-primary">Panel Admin</div>
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
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-primary hover:bg-primary/10"
                  )}
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
