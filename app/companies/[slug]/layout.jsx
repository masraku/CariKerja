import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://kerjasimpel.vercel.app";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const company = await prisma.companies.findUnique({
      where: { slug },
      select: {
        name: true,
        tagline: true,
        description: true,
        logo: true,
        industry: true,
        city: true,
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!company) {
      return {
        title: "Perusahaan Tidak Ditemukan",
        description: "Perusahaan yang Anda cari tidak ditemukan.",
      };
    }

    const title = `${company.name} - Profil Perusahaan`;
    const description = company.description
      ? company.description.substring(0, 160).replace(/<[^>]*>/g, "") + "..."
      : `${company.name} adalah perusahaan di bidang ${
          company.industry
        } yang berlokasi di ${company.city}. Lihat ${
          company._count?.jobs || 0
        } lowongan kerja tersedia.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `${siteUrl}/companies/${slug}`,
        images: [
          {
            url: company.logo || "/assets/logo-disnakerkabcirebon.png",
            width: 1200,
            height: 630,
            alt: company.name,
          },
        ],
        siteName: "Disnaker Cirebon",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [company.logo || "/assets/logo-disnakerkabcirebon.png"],
      },
      alternates: {
        canonical: `${siteUrl}/companies/${slug}`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Profil Perusahaan",
      description: "Detail perusahaan di Disnaker Cirebon",
    };
  }
}

export default function CompanyDetailLayout({ children }) {
  return children;
}
