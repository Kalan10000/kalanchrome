import type { IncomingMessage, ServerResponse } from 'node:http';

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

export default async function searchHandler(
  req: IncomingMessage & { originalUrl?: string },
  res: ServerResponse
): Promise<void> {
  const reqUrl = new URL(req.originalUrl || req.url || '/', 'http://localhost');
  const rawQuery = (reqUrl.searchParams.get('q') || '').trim();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!rawQuery) {
    res.statusCode = 200;
    res.end(JSON.stringify({ query: '', results: [], knowledge: null, tookMs: 1 }));
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

  for (const item of [...matchedShowcases, ...wikiData.results, ...hnResults]) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combined.push(item);
    }
  }

  if (combined.length < 4) {
    for (const fallback of SHOWCASE_INDEX) {
      if (!seenUrls.has(fallback.url)) {
        seenUrls.add(fallback.url);
        combined.push(fallback);
      }
    }
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      query: rawQuery,
      results: combined.slice(0, 12),
      knowledge: wikiData.knowledge,
      tookMs: Math.max(12, Date.now() - started),
    })
  );
}
