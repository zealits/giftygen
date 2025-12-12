/**
 * Sitemap generator utility
 * This can be used to generate a sitemap.xml file
 * 
 * Note: For a React SPA, you may need to generate this server-side
 * or use a service like sitemap-generator-cli
 */

export const generateSitemap = (routes = []) => {
  const baseUrl = 'https://giftygen.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const defaultRoutes = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/explore', priority: '0.9', changefreq: 'daily' },
    { url: '/login', priority: '0.5', changefreq: 'monthly' },
    { url: '/register', priority: '0.7', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  ];
  
  const allRoutes = [...defaultRoutes, ...routes];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${route.lastmod || currentDate}</lastmod>
    <changefreq>${route.changefreq || 'weekly'}</changefreq>
    <priority>${route.priority || '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
};

/**
 * Example usage:
 * 
 * const routes = [
 *   { url: '/gift-card/123', priority: '0.8', changefreq: 'weekly' },
 *   { url: '/business-slug/giftcards', priority: '0.7', changefreq: 'daily' }
 * ];
 * 
 * const sitemapXml = generateSitemap(routes);
 * // Save this to public/sitemap.xml or generate server-side
 */



