import type { MetadataRoute } from 'next';

const baseUrl = 'https://jltquest.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-06');

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
