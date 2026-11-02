import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SearchResultItem {
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  source: string;
  category: 'all' | 'engineering' | 'design' | 'news';
  publishedAt?: string;
}

interface KnowledgePanel {
  title: string;
  subtitle?: string;
  extract: string;
  url: string;
  thumbnailUrl?: string;
}

const SHOWCASE_INDEX: SearchResultItem[] = [
  {
    title: 'Verge Studio — Contemporary Architecture & Spatial Monograph',
    url: 'https://verge-studio.design',
    displayUrl: 'https://verge-studio.design › projects › pavilion',
    snippet:
      'Explore minimalist cantilevered concrete and glass residences engineered for natural light. Features fluid responsive grid architecture across mobile, tablet, and widescreen displays.',
    source: 'Verge Studio',
    category: 'design',
    publishedAt: 'Updated Oct 2026',
  },
  {
    title: 'Nordic Craft — Solid White Oak & Tactile Furniture Atelier',
    url: 'https://nordic-craft.shop',
    displayUrl: 'https://nordic-craft.shop › collection › seating',
    snippet:
      'Hand-finished Scandinavian oak lounge chairs, travertine tables, and bouclé textiles crafted in Copenhagen. Built with adaptive container queries and mobile-first commerce flows.',
    source: 'Nordic Craft',
    category: 'design',
    publishedAt: 'Catalog 2026',
  },
  {
    title: 'Pulse Cloud — Edge Infrastructure & Real-Time Observability',
    url: 'https://pulse-metrics.io',
    displayUrl: 'https://pulse-metrics.io › platform › edge-metrics',
    snippet:
      'Global edge routing, zero-cold-start compute, and live throughput analytics for engineering teams. Inspect responsive data tables, live filter tabs, and multi-column telemetry.',
    source: 'Pulse Cloud',
    category: 'engineering',
    publishedAt: 'v4.2 Documentation',
  },
  {
    title: 'The Meridian Dispatch — Science, Design & Technology Broadsheet',
    url: 'https://meridian-dispatch.org',
    displayUrl: 'https://meridian-dispatch.org › editions › autumn',
    snippet:
      'Independent journalism covering deep-space instrumentation, sustainable urbanism, and modern web standards. Reflows seamlessly from three-column desktop broadsheet to single-column reader.',
    source: 'Meridian Dispatch',
    category: 'news',
    publishedAt: 'Today',
  },
];

function isBlockedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }
  if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(lower)) {
    return true;
  }
  return false;
}

function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatBreadcrumbUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const segments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => decodeURIComponent(s));
    if (segments.length === 0) {
      return `${parsed.protocol}//${parsed.hostname}`;
    }
    return `${parsed.protocol}//${parsed.hostname} › ${segments.join(' › ')}`;
  } catch {
    return rawUrl;
  }
}

async function fetchWikipediaResults(query: string): Promise<{
  results: SearchResultItem[];
  knowledge: KnowledgePanel | null;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const searchEndpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&utf8=&format=json&srlimit=5`;
    const res = await fetch(searchEndpoint, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StudioChromeEmulator/1.0 (Educational Browser Preview)',
      },
    });
    if (!res.ok) {
      return { results: [], knowledge: null };
    }
    const data = (await res.json()) as {
      query?: {
        search?: Array<{ title: string; snippet: string; timestamp?: string }>;
      };
    };
    const items = data.query?.search ?? [];
    const results: SearchResultItem[] = items.map((item) => {
      const slug = encodeURIComponent(item.title.replace(/ /g, '_'));
      const url = `https://en.wikipedia.org/wiki/${slug}`;
      return {
        title: `${item.title} - Wikipedia`,
        url,
        displayUrl: `https://en.wikipedia.org › wiki › ${item.title.replace(/ /g, '_')}`,
        snippet: stripHtmlTags(item.snippet),
        source: 'Wikipedia',
        category: 'all',
        publishedAt: item.timestamp ? item.timestamp.slice(0, 10) : undefined,
      };
    });

    let knowledge: KnowledgePanel | null = null;
    if (items.length > 0) {
      const topSlug = encodeURIComponent(items[0].title.replace(/ /g, '_'));
      const summaryRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${topSlug}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'StudioChromeEmulator/1.0 (Educational Browser Preview)',
          },
        }
      );
      if (summaryRes.ok) {
        const summaryData = (await summaryRes.json()) as {
          title?: string;
          description?: string;
          extract?: string;
          content_urls?: { desktop?: { page?: string } };
          thumbnail?: { source?: string };
        };
        if (summaryData.title && summaryData.extract) {
          knowledge = {
            title: summaryData.title,
            subtitle: summaryData.description,
            extract: summaryData.extract,
            url:
              summaryData.content_urls?.desktop?.page ??
              `https://en.wikipedia.org/wiki/${topSlug}`,
            thumbnailUrl: summaryData.thumbnail?.source,
          };
        }
      }
    }

    return { results, knowledge };
  } catch {
    return { results: [], knowledge: null };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHackerNewsResults(query: string): Promise<SearchResultItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
      query
    )}&tags=story&hitsPerPage=5`;
    const res = await fetch(endpoint, { signal: controller.signal });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      hits?: Array<{
        title?: string;
        url?: string;
        objectID?: string;
        author?: string;
        points?: number;
        num_comments?: number;
        created_at?: string;
      }>;
    };
    const hits = data.hits ?? [];
    const mapped: SearchResultItem[] = [];
    for (const hit of hits) {
      if (!hit.title) continue;
      const targetUrl =
        hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
      let hostLabel = 'Hacker News';
      try {
        hostLabel = new URL(targetUrl).hostname.replace(/^www\./, '');
      } catch {
        // ignore
      }
      mapped.push({
        title: hit.title,
        url: targetUrl,
        displayUrl: formatBreadcrumbUrl(targetUrl),
        snippet: `Discussed on Hacker News (${hit.points ?? 0} points · ${
          hit.num_comments ?? 0
        } comments · by ${hit.author ?? 'contributor'}). Direct web article from ${hostLabel}.`,
        source: hostLabel,
        category: 'engineering',
        publishedAt: hit.created_at ? hit.created_at.slice(0, 10) : undefined,
      });
    }
    return mapped;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function buildProxyBridgeScript(finalUrl: string): string {
  return `
<script>
(function() {
  try {
    window.parent.postMessage({
      type: 'CHROME_PAGE_LOADED',
      url: ${JSON.stringify(finalUrl)},
      title: document.title || ${JSON.stringify(new URL(finalUrl).hostname)}
    }, '*');
  } catch (e) {}

  document.addEventListener('click', function(e) {
    var anchor = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!anchor) return;
    var rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }
    try {
      var resolved = new URL(rawHref, ${JSON.stringify(finalUrl)}).href;
      if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
        e.preventDefault();
        window.parent.postMessage({
          type: 'CHROME_NAVIGATE',
          url: resolved,
          newTab: Boolean(e.metaKey || e.ctrlKey || anchor.target === '_blank')
        }, '*');
      }
    } catch (err) {}
  }, true);
})();
</script>`;
}

function renderProxyFallbackHtml(targetUrl: string, statusText: string): string {
  let host = targetUrl;
  try {
    host = new URL(targetUrl).hostname;
  } catch {
    // keep raw
  }
  const safeUrl = targetUrl.replace(/[<>"']/g, '');
  const safeHost = host.replace(/[<>"']/g, '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeHost} — Site Notice</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f8fafc;
      color: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
    }
    .code {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #0f172a;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 20px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    button {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 9px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #0f172a;
    }
    button.primary {
      background: #1a73e8;
      border-color: #1a73e8;
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">${statusText.replace(/[<>"']/g, '')}</div>
    <h1>${safeHost} restricted embedded preview</h1>
    <p>This external domain blocks automated proxy requests or requires interactive browser verification. You can search Google for related pages on <strong>${safeHost}</strong> or explore one of the responsive showcase sites in the bookmarks bar.</p>
    <div class="actions">
      <button class="primary" onclick="window.parent.postMessage({ type: 'CHROME_NAVIGATE', url: 'https://www.google.com/search?q=' + encodeURIComponent('${safeHost}') }, '*')">Search Google for ${safeHost}</button>
      <button onclick="window.parent.postMessage({ type: 'CHROME_NAVIGATE', url: 'https://en.wikipedia.org/wiki/World_Wide_Web' }, '*')">Open Wikipedia</button>
    </div>
  </div>
</body>
</html>`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get('/api/search', async (req: Request, res: Response) => {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (!rawQuery) {
      res.json({ query: '', results: [], knowledge: null, tookMs: 1 });
      return;
    }

    const started = Date.now();
    const qLower = rawQuery.toLowerCase();

    const matchedShowcases = SHOWCASE_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(qLower) ||
        item.snippet.toLowerCase().includes(qLower) ||
        item.url.toLowerCase().includes(qLower) ||
        qLower.includes('responsive') ||
        qLower.includes('design') ||
        qLower.includes('website')
    );

    const [wikiData, hnResults] = await Promise.all([
      fetchWikipediaResults(rawQuery),
      fetchHackerNewsResults(rawQuery),
    ]);

    const seenUrls = new Set<string>();
    const combined: SearchResultItem[] = [];

    for (const item of [
      ...matchedShowcases,
      ...wikiData.results,
      ...hnResults,
    ]) {
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        combined.push(item);
      }
    }

    // Ensure showcase sites are always discoverable at the bottom if few results returned
    if (combined.length < 4) {
      for (const fallback of SHOWCASE_INDEX) {
        if (!seenUrls.has(fallback.url)) {
          seenUrls.add(fallback.url);
          combined.push(fallback);
        }
      }
    }

    res.json({
      query: rawQuery,
      results: combined.slice(0, 12),
      knowledge: wikiData.knowledge,
      tookMs: Math.max(12, Date.now() - started),
    });
  });

  app.get('/api/proxy', async (req: Request, res: Response) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).send(renderProxyFallbackHtml('about:blank', 'ERR_INVALID_URL'));
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      res.status(400).send(renderProxyFallbackHtml(rawUrl, 'ERR_INVALID_URL'));
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      res.status(400).send(renderProxyFallbackHtml(rawUrl, 'ERR_DISALLOWED_SCHEME'));
      return;
    }

    if (isBlockedHost(parsedUrl.hostname)) {
      res.status(403).send(renderProxyFallbackHtml(rawUrl, 'ERR_BLOCKED_LOCAL_ADDRESS'));
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);

    try {
      const upstream = await fetch(parsedUrl.href, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const contentType = upstream.headers.get('content-type') || 'text/html';
      if (!upstream.ok && upstream.status >= 400) {
        res
          .status(200)
          .setHeader('Content-Type', 'text/html; charset=utf-8')
          .send(renderProxyFallbackHtml(parsedUrl.href, `HTTP_${upstream.status}`));
        return;
      }

      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        const arrayBuf = await upstream.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        res.send(Buffer.from(arrayBuf));
        return;
      }

      let html = await upstream.text();
      const finalUrl = upstream.url || parsedUrl.href;
      const originBase = new URL('.', finalUrl).href;

      // Strip meta CSP tags that block inline bridge or framing
      html = html.replace(
        /<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi,
        ''
      );

      const baseAndBridge = `<base href="${originBase.replace(/"/g, '&quot;')}" />${buildProxyBridgeScript(
        finalUrl
      )}`;

      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/<head([^>]*)>/i, `<head$1>${baseAndBridge}`);
      } else {
        html = `${baseAndBridge}${html}`;
      }

      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch {
      res
        .status(200)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .send(renderProxyFallbackHtml(parsedUrl.href, 'ERR_CONNECTION_TIMED_OUT'));
    } finally {
      clearTimeout(timer);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Studio Chrome server listening on http://localhost:${PORT}`);
  });
}

startServer();
