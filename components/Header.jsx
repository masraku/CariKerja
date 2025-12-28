"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Building2,
  ChevronDown,
  Settings,
  Bell,
} from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef(null);
  const isHomePage = pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Lowongan", href: "/jobs" },
    { name: "Perusahaan", href: "/companies" },
    { name: "Tentang", href: "/about" },
    { name: "Syarat & Ketentuan", href: "/warning" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="h-12 md:h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md py-1 px-2">
              <img
                src="/assets/logo-disnakerkabcirebon.png"
                alt="Disnaker Kabupaten Cirebon"
                className="h-full w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? "bg-[#03587f] text-white shadow-md shadow-blue-900/20"
                    : "text-slate-600 hover:text-[#03587f] hover:bg-blue-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                      {user.role === "RECRUITER"
                        ? user.company?.name || user.name
                        : user.name || "User"}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {user.role === "RECRUITER"
                        ? "Rekruter"
                        : user.role === "JOBSEEKER"
                        ? "Pencaker"
                        : user.role}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                    {(user.role === "JOBSEEKER" && user.jobseeker?.photo) ||
                    (user.role === "RECRUITER" &&
                      (user.company?.logo || user.recruiter?.photo)) ? (
                      <img
                        src={
                          user.role === "JOBSEEKER"
                            ? user.jobseeker.photo
                            : user.company?.logo || user.recruiter?.photo
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.role === "RECRUITER"
                          ? user.company?.name || user.name
                          : user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2">
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard Admin
                        </Link>
                      )}

                      {user.role === "RECRUITER" && (
                        <Link
                          href="/profile/recruiter/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard Rekruter
                        </Link>
                      )}

                      {user.role === "JOBSEEKER" && (
                        <Link
                          href="/profile/jobseeker/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}

                      {user.role !== "RECRUITER" && (
                        <Link
                          href={`/profile/${user.role.toLowerCase()}`}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profil Saya
                        </Link>
                      )}

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Pengaturan
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                    !isScrolled &&
                    (isHomePage || pathname.startsWith("/companies"))
                      ? "text-white hover:text-blue-100"
                      : "text-slate-600 hover:text-[#03587f]"
                  }`}
                >
                  Masuk
                </Link>
                <Link
                  href="/login?action=register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#03587f] hover:bg-[#024666] rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-xl p-4 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-[#03587f]/10 text-[#03587f]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-2" />

            {user ? (
              <>
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                    {(user.role === "JOBSEEKER" && user.jobseeker?.photo) ||
                    (user.role === "RECRUITER" &&
                      (user.company?.logo || user.recruiter?.photo)) ? (
                      <img
                        src={
                          user.role === "JOBSEEKER"
                            ? user.jobseeker.photo
                            : user.company?.logo || user.recruiter?.photo
                        }
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}

                {user.role !== "RECRUITER" && (
                  <Link
                    href={`/profile/${user.role.toLowerCase()}`}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                  >
                    <User className="w-4 h-4" /> Profil Saya
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/login"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-center text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Masuk
                </Link>
                <Link
                  href="/login?action=register"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-center text-white bg-[#03587f] hover:bg-[#024666] shadow-lg shadow-blue-900/20"
                >
                  Daftar Sekarang
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
