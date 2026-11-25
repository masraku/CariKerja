import LandingPage from '@/components/LandingPage';
import { getHomepageStats, getFeaturedJobs, getTopCompanies } from '@/lib/homepage';

// Halaman dibuat ulang di server maksimal tiap 60 detik (ISR), sehingga
// pengunjung langsung menerima HTML berisi data tanpa menunggu 3 request API.
export const revalidate = 60;

// Samakan bentuk data dengan respons JSON API (Date -> string, dst).
const toJson = (value) => JSON.parse(JSON.stringify(value));

async function loadInitialData() {
  const [stats, featuredJobs, topCompanies] = await Promise.allSettled([
    getHomepageStats(),
    getFeaturedJobs(6),
    getTopCompanies(6),
  ]);

  // Jika salah satu gagal (mis. DB tidak bisa dihubungi saat build),
  // bagian itu dibiarkan kosong dan diambil ulang oleh client.
  const value = (result) =>
    result.status === 'fulfilled' ? toJson(result.value) : undefined;

  return {
    stats: value(stats),
    featuredJobs: value(featuredJobs),
    topCompanies: value(topCompanies),
  };
}

export default async function Home() {
  const initialData = await loadInitialData();
  return <LandingPage initialData={initialData} />;
}
