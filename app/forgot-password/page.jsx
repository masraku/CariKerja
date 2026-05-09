import Link from "next/link";
import { ArrowLeft, Globe2, Phone } from "lucide-react";

export const metadata = {
  title: "Bantuan Akses Akun",
  description:
    "Panduan pemulihan akses akun SIMPEL Disnaker Kabupaten Cirebon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-28">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke login
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">Bantuan akses akun</h1>
        <p className="mt-4 leading-7 text-slate-600">
          Untuk menjaga keamanan akun, pemulihan password saat ini dilakukan melalui verifikasi petugas. Hubungi layanan Disnaker Kabupaten Cirebon dengan email akun dan peran akun Anda.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href="tel:+62231321881"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <Phone className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-800">(0231) 321881</span>
          </a>
          <a
            href="https://disnaker.cirebonkab.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <Globe2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-800">disnaker.cirebonkab.go.id</span>
          </a>
        </div>
      </div>
    </main>
  );
}
