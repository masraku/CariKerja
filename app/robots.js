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
                    '/login',
                ],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    }
}
