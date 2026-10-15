import type { Plugin } from 'vite';
import { PAGES, SITE, STRUCTURED_DATA, absoluteUrl, type PageMeta } from './src/seo';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const HEAD_START = '<!-- seo:head -->';
const HEAD_END = '<!-- /seo:head -->';
const BODY_START = '<!-- seo:body -->';
const BODY_END = '<!-- /seo:body -->';

const renderHead = (page: PageMeta) => {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = absoluteUrl(page.path);
  return [
    HEAD_START,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${SITE.name}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.path === '/' ? 'profile' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="profile:first_name" content="Ahmad" />`,
    `<meta property="profile:last_name" content="Jinadu" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    // Escape "<" so the JSON can never close the script tag early
    `<script type="application/ld+json">${JSON.stringify(STRUCTURED_DATA).replace(/</g, '\\u003c')}</script>`,
    HEAD_END,
  ].join('\n    ');
};

/**
 * Crawlable content for #root. React replaces it on mount, so it only shows to
 * crawlers that don't run JavaScript and for the instant before the app loads.
 */
const renderBody = (page: PageMeta) => {
  const links = PAGES.map(
    (link) =>
      `<li><a href="${link.path}" style="color:#86efac">${escapeHtml(link.label)}</a>: ${escapeHtml(link.description)}</li>`,
  ).join('');
  const heading = page.path === '/' ? `${SITE.name}, ${SITE.jobTitle}` : page.title;
  const summary = page.path === '/' ? SITE.intro : page.description;
  return `${BODY_START}<main style="min-height:100vh;margin:0;padding:2rem;background:#000;color:#4ade80;font-family:monospace">
      <h1>${escapeHtml(heading)}</h1>
      <p>${escapeHtml(summary)}</p>
      <nav aria-label="Site"><ul>${links}</ul></nav>
      <p><a href="${SITE.github}" rel="me" style="color:#86efac">GitHub</a> · <a href="${SITE.linkedin}" rel="me" style="color:#86efac">LinkedIn</a> · <a href="mailto:${SITE.email}" style="color:#86efac">${SITE.email}</a></p>
    </main>${BODY_END}`;
};

const replaceBetween = (html: string, start: string, end: string, replacement: string) =>
  html.slice(0, html.indexOf(start)) + replacement + html.slice(html.indexOf(end) + end.length);

const sitemap = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((page) => `  <url><loc>${absoluteUrl(page.path)}</loc><changefreq>monthly</changefreq><priority>${page.path === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;

const robots = () => `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;

/**
 * Fills index.html with Home's search metadata, then emits a copy per route
 * (about.html, projects.html) so each URL serves its own title and
 * description before any JavaScript runs. Also emits robots.txt and sitemap.xml.
 */
export const seo = (): Plugin => ({
  name: 'seo',
  transformIndexHtml(html) {
    const home = PAGES[0];
    return html
      .replace(/<title>[\s\S]*?<\/title>/, renderHead(home))
      .replace('<div id="root"></div>', `<div id="root">${renderBody(home)}</div>`);
  },
  generateBundle: {
    // index.html only lands in the bundle once Vite's own HTML plugin has run
    order: 'post',
    handler(_, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset') return;
      const html = String(index.source);

      for (const page of PAGES.slice(1)) {
        const source = replaceBetween(
          replaceBetween(html, HEAD_START, HEAD_END, renderHead(page)),
          BODY_START,
          BODY_END,
          renderBody(page),
        );
        this.emitFile({ type: 'asset', fileName: `${page.path.slice(1)}.html`, source });
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
    },
  },
});
