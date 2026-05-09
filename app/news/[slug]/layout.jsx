import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://kerjasimpel.vercel.app";

async function getPublishedNews(slug) {
  return prisma.news.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      title: true,
      excerpt: true,
      content: true,
      image: true,
      category: true,
      author: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

function getDescription(news) {
  const source = news?.excerpt || news?.content || "";
  const text = sanitizeText(source).replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const news = await getPublishedNews(slug);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
      description: "Berita yang Anda cari tidak ditemukan atau belum dipublikasikan.",
      robots: { index: false, follow: false },
    };
  }

  const title = news.title;
  const description = getDescription(news);
  const url = `${siteUrl}/news/${slug}`;
  const image = news.image || "/assets/logo-disnakerkabcirebon.png";

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: news.publishedAt?.toISOString(),
      modifiedTime: news.updatedAt?.toISOString(),
      authors: [news.author],
      section: news.category,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      siteName: "Disnaker Kabupaten Cirebon",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function NewsDetailLayout({ children, params }) {
  const { slug } = await params;
  const news = await getPublishedNews(slug);
  const jsonLd = news
    ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: news.title,
        description: getDescription(news),
        image: news.image ? [news.image] : undefined,
        datePublished: news.publishedAt?.toISOString(),
        dateModified: news.updatedAt?.toISOString(),
        author: { "@type": "Person", name: news.author },
        publisher: {
          "@type": "Organization",
          name: "Disnaker Kabupaten Cirebon",
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/assets/logo-disnakerkabcirebon.png`,
          },
        },
        mainEntityOfPage: `${siteUrl}/news/${slug}`,
      }
    : null;

  return (
    <>
      {news && (
        <article className="sr-only" aria-label="Ringkasan artikel berita">
          <h1>{news.title}</h1>
          <p>{getDescription(news)}</p>
          <p>{sanitizeText(news.content).slice(0, 1200)}</p>
        </article>
      )}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
