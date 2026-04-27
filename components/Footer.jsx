import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { icon: Facebook, label: "Facebook" },
    { icon: Twitter, label: "Twitter" },
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Instagram, label: "Instagram" },
  ];

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
              {socialLinks.map(({ icon: Icon, label }) => (
                <a key={label} href="#" aria-label={label}>
                  <IconBadge icon={Icon} variant="muted" className="rounded-full hover:border-primary/20 hover:bg-primary/10 hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div className="lg:col-span-4">
            <h3 className="font-semibold text-slate-900 mb-6">Lokasi Kantor</h3>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.5399471687738!2d108.55199347475992!3d-6.706666666666667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f0403a0000001%3A0x1!2zNsKwNDInMjQuMCJTIDEwOMKwMzMnMTIuMCJF!5e0!3m2!1sen!2sid!4v1703764800000!5m2!1sen!2sid"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Disnaker Kabupaten Cirebon"
              ></iframe>
            </div>
            <a
              href="https://maps.app.goo.gl/ybHtX9x4Py8AhPa86"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:text-primary-hover font-medium hover:underline"
            >
              📍 Buka di Google Maps
            </a>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="font-semibold text-slate-900 mb-6">Hubungi Kami</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-800 mb-1">Alamat:</p>
                <p>Jl. Sunan Kalijaga No. 7, Sumber</p>
                <p>Kabupaten Cirebon, Jawa Barat 45611</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">Telepon:</p>
                <a
                  href="tel:+62231321881"
                  className="hover:text-primary transition-colors"
                >
                  (0231) 321881
                </a>
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">
                  Jam Operasional:
                </p>
                <p>Senin - Jumat: 08.00 - 16.00 WIB</p>
                <p className="text-slate-400">Sabtu, Minggu & Libur: Tutup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} Dinas Ketenagakerjaan Kabupaten Cirebon
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/warning"
              className="hover:text-primary transition-colors"
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
