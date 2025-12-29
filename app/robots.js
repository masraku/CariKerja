const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kerjasimpel.vercel.app'

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                    '/interviews/',
                    '/warning/',
                    '/_next/',
                    '/login?*',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/profile/',
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    }
}
