"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCSRFToken } from "@/lib/api";
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  LogOut,
  Building2,
  UserRoundCheck,
  Settings2,
  CalendarCheck,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function RecruiterSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/profile/recruiter/dashboard",
    },
    {
      icon: PlusCircle,
      label: "Pasang Lowongan",
      href: "/profile/recruiter/post-job",
    },
    {
      icon: Briefcase,
      label: "Lowongan Saya",
      href: "/profile/recruiter/dashboard/jobs",
    },
    {
      icon: CalendarCheck,
      label: "Kelola Interview",
      href: "/profile/recruiter/dashboard/interviews",
    },
    {
      icon: UserRoundCheck,
      label: "Pelamar Diterima",
      href: "/profile/recruiter/dashboard/hired",
    },
    { icon: Settings2, label: "Profil Perusahaan", href: "/profile/recruiter" },
  ];

  const handleLogout = async () => {
    try {
      const csrfToken = getCSRFToken();
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="w-64 bg-card text-primary flex flex-col h-screen sticky top-0 border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/profile/recruiter/dashboard"
          className="flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg overflow-hidden text-primary-foreground">
            {user?.company?.logo ? (
              <img
                src={user.company.logo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-lg truncate text-primary">
              {user?.company?.name || "Perusahaan"}
            </div>
            <div className="text-xs text-gray-500">Panel Perusahaan</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            let isActive = false;
            if (item.href === "/profile/recruiter/dashboard") {
              isActive = pathname === "/profile/recruiter/dashboard";
            } else if (item.href === "/profile/recruiter") {
              isActive = pathname === "/profile/recruiter";
            } else if (item.href === "/profile/recruiter/dashboard/jobs") {
              isActive = pathname.startsWith(
                "/profile/recruiter/dashboard/jobs",
              );
            } else if (
              item.href === "/profile/recruiter/dashboard/interviews"
            ) {
              isActive =
                pathname.startsWith(
                  "/profile/recruiter/dashboard/interviews",
                ) ||
                pathname.startsWith("/profile/recruiter/dashboard/interview?");
            } else if (
              item.href === "/profile/recruiter/dashboard/resignations"
            ) {
              isActive = pathname.startsWith(
                "/profile/recruiter/dashboard/resignations",
              );
            } else {
              isActive = pathname === item.href;
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-primary hover:bg-primary/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
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
