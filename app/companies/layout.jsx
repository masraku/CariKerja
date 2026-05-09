import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export const metadata = {
  title: "Perusahaan Terverifikasi",
  description:
    "Daftar perusahaan terverifikasi yang terdaftar di Disnaker Cirebon. Temukan perusahaan terpercaya untuk karir Anda.",
  openGraph: {
    title: "Perusahaan Terverifikasi - Disnaker Cirebon",
    description:
      "Daftar perusahaan terverifikasi yang terdaftar di Disnaker Cirebon.",
  },
};

async function getCompaniesSnapshot() {
  try {
    return prisma.companies.findMany({
      where: {
        verified: true,
        recruiters: { some: {} },
      },
      select: {
        name: true,
        slug: true,
        industry: true,
        city: true,
        province: true,
        description: true,
      },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      take: 12,
    });
  } catch (error) {
    return [];
  }
}

export default async function CompaniesLayout({ children }) {
  const companies = await getCompaniesSnapshot();

  return (
    <>
      <section className="sr-only" aria-label="Ringkasan perusahaan terverifikasi">
        <h1>Perusahaan Terverifikasi Kabupaten Cirebon</h1>
        <p>
          Direktori perusahaan terverifikasi yang membuka peluang kerja melalui
          portal Disnaker Kabupaten Cirebon.
        </p>
        <ul>
          {companies.map((company) => (
            <li key={company.slug}>
              <a href={`/companies/${company.slug}`}>{company.name}</a>
              {` bidang ${company.industry || "usaha"} di ${company.city || "Cirebon"}${company.province ? `, ${company.province}` : ""}. `}
              {sanitizeText(company.description).slice(0, 180)}
            </li>
          ))}
        </ul>
      </section>
      {children}
    </>
  );
}
