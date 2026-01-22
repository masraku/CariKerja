import { Wrench, Clock, Mail } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Sedang Dalam Perbaikan
        </h1>

        <p className="text-slate-600 mb-8 leading-relaxed">
          Mohon maaf, sistem kami sedang menjalani pemeliharaan terjadwal untuk
          meningkatkan layanan. Kami akan segera kembali!
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Estimasi selesai: Segera kembali</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Mail className="w-5 h-5 text-blue-500" />
            <span>Kontak: support@disnaker.cirebon.go.id</span>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-400">
          Disnaker Cirebon &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
