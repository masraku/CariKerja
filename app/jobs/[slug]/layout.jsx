import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://kerjasimpel.vercel.app";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const job = await prisma.jobs.findFirst({
      where: { slug },
      select: {
        title: true,
        description: true,
        city: true,
        photo: true,
        salaryMin: true,
        salaryMax: true,
        showSalary: true,
        jobType: true,
        companies: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!job) {
      return {
        title: "Lowongan Tidak Ditemukan",
        description: "Lowongan kerja yang Anda cari tidak ditemukan.",
      };
    }

    const companyName = job.companies?.name || "Perusahaan";
    const title = `${job.title} - ${companyName}`;
    const description = job.description
      ? job.description.substring(0, 160).replace(/<[^>]*>/g, "") + "..."
      : `Lowongan kerja ${job.title} di ${companyName}, ${job.city}. Lamar sekarang di Disnaker Cirebon.`;

    const salary =
      job.showSalary && job.salaryMin && job.salaryMax
        ? ` Gaji Rp ${(job.salaryMin / 1000000).toFixed(0)}-${(
            job.salaryMax / 1000000
          ).toFixed(0)} juta.`
        : "";

    return {
      title,
      description: description + salary,
      openGraph: {
        title,
        description: description + salary,
        type: "website",
        url: `${siteUrl}/jobs/${slug}`,
        images: [
          {
            url:
              job.photo ||
              job.companies?.logo ||
              "/assets/logo-disnakerkabcirebon.png",
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        siteName: "Disnaker Cirebon",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description + salary,
        images: [
          job.photo ||
            job.companies?.logo ||
            "/assets/logo-disnakerkabcirebon.png",
        ],
      },
      alternates: {
        canonical: `${siteUrl}/jobs/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Lowongan Kerja",
      description: "Detail lowongan kerja di Disnaker Cirebon",
    };
  }
}

export default function JobDetailLayout({ children }) {
  return children;
}
