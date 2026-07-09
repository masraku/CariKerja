import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export const metadata = {
  title: "Lowongan Kerja Cirebon",
  description:
    "Temukan lowongan kerja terbaru di Cirebon dan sekitarnya. Lamar pekerjaan dari perusahaan terverifikasi dengan mudah.",
  openGraph: {
    title: "Lowongan Kerja Cirebon - Disnaker",
    description:
      "Temukan lowongan kerja terbaru di Cirebon dan sekitarnya.",
  },
};

async function getLatestJobsSnapshot() {
  try {
    const jobs = await prisma.jobs.findMany({
      where: {
        status: "ACTIVE",
        publishedAt: { not: null },
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: new Date() } },
        ],
      },
      select: {
        title: true,
        slug: true,
        city: true,
        province: true,
        description: true,
        companies: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });

    return jobs;
  } catch (error) {
    return [];
  }
}

export default async function JobsLayout({ children }) {
  const jobs = await getLatestJobsSnapshot();

  return (
    <>
      <section className="sr-only" aria-label="Ringkasan lowongan terbaru">
        <h1>Lowongan Kerja Kabupaten Cirebon</h1>
        <p>
          Daftar lowongan kerja aktif dari perusahaan terverifikasi di Kabupaten
          Cirebon dan sekitarnya.
        </p>
        <ul>
          {jobs.map((job) => (
            <li key={job.slug}>
              <a href={`/jobs/${job.slug}`}>{job.title}</a>
              {` di ${job.companies?.name || "perusahaan terverifikasi"}, ${job.city || "Cirebon"}${job.province ? `, ${job.province}` : ""}. `}
              {sanitizeText(job.description).slice(0, 180)}
            </li>
          ))}
        </ul>
      </section>
      {children}
    </>
  );
}
