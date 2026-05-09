import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

export const metadata = {
  title: "Berita & Artikel Ketenagakerjaan",
  description:
    "Informasi resmi seputar ketenagakerjaan, lowongan kerja, pelatihan, dan tips karir di Kabupaten Cirebon.",
  openGraph: {
    title: "Berita & Artikel - Disnaker Kabupaten Cirebon",
    description:
      "Baca informasi ketenagakerjaan terbaru dari Disnaker Kabupaten Cirebon.",
    type: "website",
  },
};

async function getNewsSnapshot() {
  try {
    return prisma.news.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });
  } catch (error) {
    return [];
  }
}

export default async function NewsLayout({ children }) {
  const news = await getNewsSnapshot();

  return (
    <>
      <section className="sr-only" aria-label="Ringkasan berita ketenagakerjaan">
        <h1>Berita dan Artikel Ketenagakerjaan Kabupaten Cirebon</h1>
        <p>
          Informasi resmi seputar ketenagakerjaan, lowongan, pelatihan, dan tips
          karir di Kabupaten Cirebon.
        </p>
        <ul>
          {news.map((item) => (
            <li key={item.slug}>
              <a href={`/news/${item.slug}`}>{item.title}</a>
              {` kategori ${item.category}. `}
              {sanitizeText(item.excerpt || item.content).slice(0, 180)}
            </li>
          ))}
        </ul>
      </section>
      {children}
    </>
  );
}
