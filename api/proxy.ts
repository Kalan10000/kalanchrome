import type { IncomingMessage, ServerResponse } from 'node:http';

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

export default async function proxyHandler(
  req: IncomingMessage & { originalUrl?: string },
  res: ServerResponse
): Promise<void> {
  const reqUrl = new URL(req.originalUrl || req.url || '/', 'http://localhost');
  const rawUrl = (reqUrl.searchParams.get('url') || '').trim();

  if (!rawUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderProxyFallbackHtml('about:blank', 'ERR_INVALID_URL'));
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderProxyFallbackHtml(rawUrl, 'ERR_INVALID_URL'));
    return;
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderProxyFallbackHtml(rawUrl, 'ERR_DISALLOWED_SCHEME'));
    return;
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderProxyFallbackHtml(rawUrl, 'ERR_BLOCKED_LOCAL_ADDRESS'));
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
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(renderProxyFallbackHtml(parsedUrl.href, `HTTP_${upstream.status}`));
      return;
    }

    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml+xml')
    ) {
      const arrayBuf = await upstream.arrayBuffer();
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(Buffer.from(arrayBuf));
      return;
    }

    let html = await upstream.text();
    const finalUrl = upstream.url || parsedUrl.href;
    const originBase = new URL('.', finalUrl).href;

    html = html.replace(
      /<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi,
      ''
    );

    const baseAndBridge = `<base href="${originBase.replace(
      /"/g,
      '&quot;'
    )}" />${buildProxyBridgeScript(finalUrl)}`;

    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseAndBridge}`);
    } else {
      html = `${baseAndBridge}${html}`;
    }

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(html);
  } catch {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(renderProxyFallbackHtml(parsedUrl.href, 'ERR_CONNECTION_TIMED_OUT'));
  } finally {
    clearTimeout(timer);
  }
}
