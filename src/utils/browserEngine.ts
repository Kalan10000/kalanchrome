export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  reloadNonce: number;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
}

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'mobile' | 'tablet' | 'desktop' | 'custom';
  userAgentHint: string;
}

export type ZoomSetting = 'auto' | 50 | 75 | 100;

export interface ParsedNavigation {
  kind: 'internal' | 'search' | 'url';
  url: string;
  query?: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'responsive',
    name: 'Responsive (Drag)',
    width: 1024,
    height: 720,
    category: 'custom',
    userAgentHint: 'Desktop / Fluid',
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    category: 'mobile',
    userAgentHint: 'Mobile Touch · 3x DPR',
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    category: 'mobile',
    userAgentHint: 'Compact Mobile · 2x DPR',
  },
  {
    id: 'pixel-8',
    name: 'Pixel 8',
    width: 412,
    height: 915,
    category: 'mobile',
    userAgentHint: 'Android Mobile · 2.6x DPR',
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    width: 820,
    height: 1180,
    category: 'tablet',
    userAgentHint: 'Tablet · 2x DPR',
  },
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    category: 'tablet',
    userAgentHint: 'Tablet · 2x DPR',
  },
  {
    id: 'macbook-air',
    name: 'Laptop 13"',
    width: 1280,
    height: 800,
    category: 'desktop',
    userAgentHint: 'Desktop · 2x DPR',
  },
  {
    id: 'studio-display',
    name: 'Widescreen HD',
    width: 1440,
    height: 900,
    category: 'desktop',
    userAgentHint: 'Desktop · Widescreen',
  },
];

export const BREAKPOINT_STOPS = [
  { label: 'Mobile S', width: 320 },
  { label: 'Mobile M', width: 375 },
  { label: 'Mobile L', width: 425 },
  { label: 'Tablet', width: 768 },
  { label: 'Laptop', width: 1024 },
  { label: 'Desktop', width: 1440 },
] as const;

const DOMAIN_LIKE_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d{2,5})?(?:[/?#].*)?$/;

export function parseOmniboxInput(rawInput: string): ParsedNavigation | null {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  // Internal chrome:// routes
  if (lower.startsWith('chrome://')) {
    const route = lower.replace(/^chrome:\/\//, '').split(/[/?#]/)[0] || 'newtab';
    if (route === 'newtab' || route === 'history' || route === 'bookmarks') {
      return { kind: 'internal', url: `chrome://${route}` };
    }
    return { kind: 'internal', url: 'chrome://newtab' };
  }

  // Explicit Google Search URL
  if (
    (lower.startsWith('https://www.google.com/search') ||
      lower.startsWith('http://www.google.com/search') ||
      lower.startsWith('https://google.com/search')) &&
    trimmed.includes('?')
  ) {
    try {
      const parsed = new URL(trimmed);
      const q = parsed.searchParams.get('q') || '';
      if (q.trim()) {
        const params = new URLSearchParams({ q: q.trim() });
        return {
          kind: 'search',
          url: `https://www.google.com/search?${params.toString()}`,
          query: q.trim(),
        };
      }
    } catch {
      // fall through
    }
  }

  // Explicit http:// or https:// URL without spaces
  if ((lower.startsWith('http://') || lower.startsWith('https://')) && !/\s/.test(trimmed)) {
    try {
      const valid = new URL(trimmed);
      return { kind: 'url', url: valid.href.replace(/\/$/, '') || valid.href };
    } catch {
      // treat invalid URL as search
    }
  }

  // Domain-like bare input (e.g. "wikipedia.org", "verge-studio.design", "en.wikipedia.org/wiki/CSS")
  if (!/\s/.test(trimmed) && DOMAIN_LIKE_REGEX.test(trimmed)) {
    const withProtocol = `https://${trimmed}`;
    try {
      const valid = new URL(withProtocol);
      const normalized =
        valid.pathname === '/' && !valid.search && !valid.hash
          ? `${valid.protocol}//${valid.host}`
          : valid.href;
      return { kind: 'url', url: normalized };
    } catch {
      // fall through to search
    }
  }

  const params = new URLSearchParams({ q: trimmed });
  return {
    kind: 'search',
    url: `https://www.google.com/search?${params.toString()}`,
    query: trimmed,
  };
}

export function extractGoogleSearchQuery(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      (parsed.hostname === 'www.google.com' || parsed.hostname === 'google.com') &&
      parsed.pathname === '/search'
    ) {
      return parsed.searchParams.get('q') ?? '';
    }
    return null;
  } catch {
    return null;
  }
}

export function deriveTabTitleFromUrl(url: string): string {
  if (url === 'chrome://newtab') return 'New Tab';
  if (url === 'chrome://history') return 'History';
  if (url === 'chrome://bookmarks') return 'Bookmarks';

  const query = extractGoogleSearchQuery(url);
  if (query !== null) {
    return query ? `${query} - Google Search` : 'Google Search';
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'verge-studio.design') return 'Verge Studio — Architecture';
    if (host === 'nordic-craft.shop') return 'Nordic Craft — Atelier';
    if (host === 'pulse-metrics.io') return 'Pulse Cloud — Edge Telemetry';
    if (host === 'meridian-dispatch.org') return 'The Meridian Dispatch';
    if (parsed.pathname && parsed.pathname !== '/') {
      const lastSeg = decodeURIComponent(
        parsed.pathname.split('/').filter(Boolean).pop() || ''
      ).replace(/_/g, ' ');
      if (lastSeg) {
        return `${lastSeg} · ${host}`;
      }
    }
    return host;
  } catch {
    return url;
  }
}

export function createBrowserTab(id: string, initialUrl = 'chrome://newtab'): BrowserTab {
  return {
    id,
    title: deriveTabTitleFromUrl(initialUrl),
    url: initialUrl,
    history: [initialUrl],
    historyIndex: 0,
    isLoading: initialUrl !== 'chrome://newtab',
    reloadNonce: 0,
  };
}

export function navigateTab(tab: BrowserTab, nextUrl: string): BrowserTab {
  const slicedHistory = tab.history.slice(0, tab.historyIndex + 1);
  // Avoid duplicate consecutive entries
  if (slicedHistory[slicedHistory.length - 1] !== nextUrl) {
    slicedHistory.push(nextUrl);
  }
  const nextIndex = slicedHistory.length - 1;
  const isInstantInternal = nextUrl.startsWith('chrome://');
  return {
    ...tab,
    url: nextUrl,
    title: deriveTabTitleFromUrl(nextUrl),
    history: slicedHistory,
    historyIndex: nextIndex,
    isLoading: !isInstantInternal,
    reloadNonce: tab.reloadNonce + 1,
  };
}

export function stepTabHistory(tab: BrowserTab, delta: -1 | 1): BrowserTab {
  const targetIndex = tab.historyIndex + delta;
  if (targetIndex < 0 || targetIndex >= tab.history.length) {
    return tab;
  }
  const targetUrl = tab.history[targetIndex];
  const isInstantInternal = targetUrl.startsWith('chrome://');
  return {
    ...tab,
    url: targetUrl,
    title: deriveTabTitleFromUrl(targetUrl),
    historyIndex: targetIndex,
    isLoading: !isInstantInternal,
    reloadNonce: tab.reloadNonce + 1,
  };
}

export function clampViewportDimension(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.round(Math.min(max, Math.max(min, value)));
}

export function getCssBreakpointBadge(width: number): {
  code: string;
  description: string;
} {
  if (width < 480) {
    return { code: 'xs (<480px)', description: 'Mobile Portrait' };
  }
  if (width < 768) {
    return { code: 'sm (480–767px)', description: 'Mobile Landscape' };
  }
  if (width < 1024) {
    return { code: 'md (768–1023px)', description: 'Tablet Layout' };
  }
  if (width < 1280) {
    return { code: 'lg (1024–1279px)', description: 'Laptop Grid' };
  }
  return { code: 'xl (≥1280px)', description: 'Desktop Widescreen' };
}

export function computeResponsiveScale(
  targetWidth: number,
  targetHeight: number,
  availableWidth: number,
  availableHeight: number,
  zoom: ZoomSetting
): number {
  if (zoom !== 'auto') {
    return zoom / 100;
  }
  if (availableWidth <= 0 || availableHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) {
    return 1;
  }
  const paddingX = 48;
  const paddingY = 48;
  const usableW = Math.max(200, availableWidth - paddingX);
  const usableH = Math.max(200, availableHeight - paddingY);
  const scaleX = usableW / targetWidth;
  const scaleY = usableH / targetHeight;
  const fitScale = Math.min(1, scaleX, scaleY);
  return Math.max(0.25, Math.round(fitScale * 100) / 100);
}
