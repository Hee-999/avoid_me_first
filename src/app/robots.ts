import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovepattern.site';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/columns', '/sample-result', '/privacy', '/terms', '/refund'],
      disallow: ['/api/', '/result/', '/report/', '/share/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
