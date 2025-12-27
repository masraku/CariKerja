import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Send,
  Heart,
  Briefcase,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center group mb-6">
              <div className="h-16 md:h-20 w-auto bg-white rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-sm border border-slate-100 p-2">
                <img
                  src="/assets/logo-disnakerkabcirebon.png"
                  alt="Disnaker Kabupaten Cirebon"
                  className="h-full w-auto"
                />
              </div>
            </Link>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Platform karir masa depan yang menghubungkan talenta terbaik
              dengan perusahaan impian. Temukan peluang karir yang sesuai dengan
              passion Anda.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-6">Pencari Kerja</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/jobs"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Cari Lowongan
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Perusahaan
                </Link>
              </li>
              <li>
                <Link
                  href="/salaries"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Cek Gaji
                </Link>
              </li>
              <li>
                <Link
                  href="/career-tips"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Tips Karir
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-6">Perusahaan</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/post-job"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Pasang Iklan
                </Link>
              </li>
              <li>
                <Link
                  href="/talent-search"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Cari Kandidat
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Harga
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Partner
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="font-semibold text-slate-900 mb-6">Newsletter</h3>
            <p className="text-slate-500 mb-4">
              Dapatkan info lowongan terbaru setiap minggu.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-600 placeholder:text-slate-400"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Dinas Ketenagakerjaan Kabupaten Cirebon
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link
              href="/warning"
              className="hover:text-blue-600 transition-colors"
            >
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
