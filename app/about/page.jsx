import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  FileCheck,
  MapPin,
  Phone,
  Shield,
  Users,
} from "lucide-react";

const serviceHighlights = [
  {
    icon: Shield,
    title: "Lowongan lebih tertib",
    description:
      "Informasi lowongan disusun agar pencari kerja mudah memahami posisi, lokasi, dan kebutuhan perusahaan.",
  },
  {
    icon: Building2,
    title: "Perusahaan terdata",
    description:
      "Profil perusahaan dikelola supaya proses rekrutmen berjalan lebih jelas dan dapat ditelusuri.",
  },
  {
    icon: FileCheck,
    title: "Administrasi lebih ringkas",
    description:
      "Pencari kerja dapat menyiapkan profil, dokumen, dan riwayat lamaran dari satu tempat.",
  },
  {
    icon: Users,
    title: "Akses untuk warga Cirebon",
    description:
      "Platform ini membantu mempertemukan kebutuhan tenaga kerja lokal dengan peluang yang tersedia.",
  },
];

const workFlows = [
  "Pencari kerja melengkapi profil dan dokumen pendukung.",
  "Perusahaan mempublikasikan lowongan dengan informasi yang jelas.",
  "Lamaran diproses secara lebih transparan melalui platform.",
];

const commitments = [
  "Menjaga informasi lowongan tetap relevan dan mudah dipahami.",
  "Mendorong perusahaan memberi proses seleksi yang jelas.",
  "Melindungi data pengguna sesuai kebutuhan layanan ketenagakerjaan.",
  "Menyediakan akses yang sederhana untuk pencari kerja dan pemberi kerja.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <section className="border-b border-slate-200 bg-white">
        <div className="container mx-auto grid gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
              <Shield className="h-4 w-4" />
              Platform Disnaker Kabupaten Cirebon
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Menghubungkan pencari kerja dan perusahaan dengan cara yang lebih
              tertib.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              SIMPel adalah layanan digital ketenagakerjaan untuk membantu warga
              Kabupaten Cirebon menemukan informasi lowongan, menyiapkan profil,
              dan mengikuti proses rekrutmen secara lebih mudah.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Lihat Lowongan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              >
                Lihat Perusahaan
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm lg:p-6">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Fokus Layanan
              </p>
              <h2 className="mt-4 text-2xl font-bold text-slate-950">
                Portal kerja yang dekat dengan kebutuhan daerah.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Layanan ini dirancang untuk memudahkan informasi ketenagakerjaan
                tersampaikan dengan rapi, tanpa membuat pencari kerja harus
                mencari dari banyak sumber yang tidak jelas.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  [Briefcase, "Informasi lowongan"],
                  [FileCheck, "Profil dan dokumen"],
                  [Building2, "Data perusahaan"],
                ].map(([Icon, label]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-800">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Yang Kami Kerjakan
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Layanan dibuat sederhana, jelas, dan tidak berlebihan.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {serviceHighlights.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Alur Layanan
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Dari profil sampai proses lamaran, semuanya dibuat lebih rapi.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Kami menata proses utama agar pencari kerja dan perusahaan memiliki
              ekspektasi yang sama sejak awal.
            </p>
          </div>

          <div className="space-y-4">
            {workFlows.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="pt-1 leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="container mx-auto grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] bg-primary p-8 text-white shadow-sm lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
              Komitmen
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Membangun ekosistem kerja yang lebih aman dan transparan.
            </h2>
            <p className="mt-5 leading-8 text-blue-100">
              Platform ini bukan sekadar daftar lowongan. Kami ingin proses
              rekrutmen lebih mudah dipantau, lebih jelas, dan lebih bertanggung
              jawab bagi semua pihak.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
            <div className="space-y-4">
              {commitments.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 flex-none text-primary" />
                  <p className="leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="container mx-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Butuh informasi langsung?
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Hubungi Dinas Ketenagakerjaan Kabupaten Cirebon untuk pertanyaan
                terkait layanan ketenagakerjaan dan informasi platform.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="tel:+62231321881"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:text-primary"
              >
                <Phone className="h-5 w-5 text-primary" />
                (0231) 321881
              </a>
              <a
                href="https://maps.app.goo.gl/ybHtX9x4Py8AhPa86"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:text-primary"
              >
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi Kantor
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
