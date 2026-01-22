import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi dan perlindungan data pribadi pengguna Disnaker Kabupaten Cirebon",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Kebijakan Privasi
          </h1>
          <p className="text-slate-500 mb-8">
            Terakhir diperbarui: Januari 2026
          </p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                1. Pendahuluan
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Dinas Ketenagakerjaan Kabupaten Cirebon ("kami") berkomitmen
                untuk melindungi privasi dan data pribadi Anda. Kebijakan ini
                menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan,
                dan melindungi informasi Anda sesuai dengan Undang-Undang
                Perlindungan Data Pribadi (UU PDP) dan peraturan yang berlaku di
                Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                2. Data yang Kami Kumpulkan
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kami mengumpulkan data berikut:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Data Identitas:</strong> Nama, NIK, alamat, tanggal
                  lahir, foto
                </li>
                <li>
                  <strong>Data Kontak:</strong> Email, nomor telepon
                </li>
                <li>
                  <strong>Data Profesional:</strong> Riwayat pendidikan,
                  pengalaman kerja, keahlian, CV
                </li>
                <li>
                  <strong>Data Perusahaan:</strong> Nama perusahaan, alamat,
                  SIUP, dokumen legalitas
                </li>
                <li>
                  <strong>Data Teknis:</strong> Alamat IP, jenis browser, waktu
                  akses (untuk keamanan)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                3. Penggunaan Data
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Data Anda digunakan untuk:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  Mencocokkan pencari kerja dengan lowongan pekearjaan yang
                  sesuai
                </li>
                <li>Memverifikasi identitas perusahaan dan pencari kerja</li>
                <li>Memfasilitasi proses rekrutmen dan wawancara</li>
                <li>Mengirim notifikasi terkait lamaran dan status kerja</li>
                <li>Meningkatkan layanan dan keamanan platform</li>
                <li>Memenuhi kewajiban hukum dan pelaporan ketenagakerjaan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                4. Penyimpanan dan Keamanan
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kami menerapkan langkah-langkah keamanan berikut:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Enkripsi data saat transmisi (HTTPS/TLS)</li>
                <li>Password di-hash dengan algoritma Argon2</li>
                <li>
                  Akses data dibatasi berdasarkan peran (role-based access)
                </li>
                <li>Audit log untuk aktivitas sensitif</li>
                <li>Backup data reguler dengan enkripsi</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Data disimpan selama diperlukan untuk layanan atau sesuai
                ketentuan hukum yang berlaku.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                5. Hak Anda
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Sesuai UU PDP, Anda memiliki hak untuk:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Akses:</strong> Meminta salinan data pribadi Anda
                </li>
                <li>
                  <strong>Koreksi:</strong> Memperbaiki data yang tidak akurat
                </li>
                <li>
                  <strong>Penghapusan:</strong> Meminta penghapusan data (dengan
                  batasan hukum)
                </li>
                <li>
                  <strong>Pembatasan:</strong> Membatasi pemrosesan data
                  tertentu
                </li>
                <li>
                  <strong>Portabilitas:</strong> Menerima data dalam format yang
                  dapat dibaca mesin
                </li>
                <li>
                  <strong>Penarikan Persetujuan:</strong> Menarik persetujuan
                  kapan saja
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                6. Berbagi Data
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami tidak menjual data Anda. Data hanya dibagikan kepada:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Perusahaan yang Anda lamar (untuk proses rekrutmen)</li>
                <li>Instansi pemerintah terkait (untuk kewajiban pelaporan)</li>
                <li>Penyedia layanan teknis (dengan perjanjian kerahasiaan)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                7. Cookie
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami menggunakan cookie untuk autentikasi dan keamanan. Cookie
                ini diperlukan untuk fungsi dasar platform dan tidak digunakan
                untuk pelacakan pihak ketiga.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                8. Perubahan Kebijakan
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan
                signifikan akan diberitahukan melalui email atau notifikasi di
                platform. Penggunaan berkelanjutan setelah perubahan dianggap
                sebagai persetujuan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                9. Hubungi Kami
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Untuk pertanyaan tentang privasi atau menggunakan hak Anda,
                hubungi:
              </p>
              <div className="bg-slate-50 rounded-xl p-6 mt-4">
                <p className="text-slate-700 font-medium">
                  Dinas Ketenagakerjaan Kabupaten Cirebon
                </p>
                <p className="text-slate-600">
                  Jl. Sunan Kalijaga No. 7, Sumber
                </p>
                <p className="text-slate-600">
                  Kabupaten Cirebon, Jawa Barat 45611
                </p>
                <p className="text-slate-600 mt-2">Telepon: (0231) 321881</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
