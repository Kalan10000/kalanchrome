import chairImgUrl from '../assets/images/nordic_oak_lounge_chair_1793366297520.jpg';
import pavilionImgUrl from '../assets/images/architectural_glass_pavilion_1793366297520.jpg';

export interface ShowcaseSite {
  hostname: string;
  url: string;
  title: string;
  description: string;
  accentColor: string;
  getHtml: () => string;
}

const BRIDGE_SCRIPT = `
<script>
  window.addEventListener('DOMContentLoaded', function() {
    window.parent.postMessage({ type: 'CHROME_PAGE_LOADED', title: document.title }, '*');
  });
</script>
`;

export const SHOWCASE_SITES: Record<string, ShowcaseSite> = {
  'verge-studio.design': {
    hostname: 'verge-studio.design',
    url: 'https://verge-studio.design',
    title: 'Verge Studio — Architecture',
    description: 'Minimalist concrete & glass monograph with adaptive responsive grids',
    accentColor: '#d97706',
    getHtml: () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verge Studio — Architecture &amp; Spatial Practice</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #faf9f6;
      color: #18181b;
      line-height: 1.6;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 36px;
      border-bottom: 1px solid #e4e4e7;
      background: rgba(250, 249, 246, 0.94);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .brand { font-weight: 700; font-size: 18px; letter-spacing: -0.02em; }
    .nav-links { display: flex; gap: 28px; font-size: 14px; color: #52525b; }
    .nav-links a { color: inherit; text-decoration: none; cursor: pointer; }
    .nav-links a:hover { color: #18181b; text-decoration: underline; }
    .cta-btn {
      background: #18181b; color: #fff; border: none; border-radius: 6px;
      padding: 9px 18px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .menu-toggle {
      display: none; background: transparent; border: 1px solid #d4d4d8;
      border-radius: 6px; padding: 7px 12px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .mobile-drawer {
      display: none; flex-direction: column; gap: 12px; padding: 16px 20px;
      background: #f4f4f5; border-bottom: 1px solid #e4e4e7; font-size: 14px;
    }
    .mobile-drawer.open { display: flex; }
    .mobile-drawer a { color: #18181b; text-decoration: none; font-weight: 500; }
    .container { max-width: 1140px; margin: 0 auto; padding: 48px 36px; }
    .hero {
      display: grid;
      grid-template-columns: 1.05fr 1.25fr;
      gap: 44px;
      align-items: center;
      margin-bottom: 64px;
    }
    .kicker { font-size: 12px; color: #71717a; margin-bottom: 14px; }
    h1 {
      font-size: clamp(28px, 3.6vw, 46px);
      line-height: 1.12;
      letter-spacing: -0.03em;
      margin-bottom: 18px;
    }
    .lead { font-size: 16px; color: #52525b; margin-bottom: 26px; }
    .hero-media {
      border-radius: 10px;
      overflow: hidden;
      background: linear-gradient(135deg, #27272a, #52525b);
      aspect-ratio: 16 / 10;
    }
    .hero-media img {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      padding: 28px 0;
      border-top: 1px solid #e4e4e7;
      border-bottom: 1px solid #e4e4e7;
      margin-bottom: 56px;
    }
    .metric-val { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .metric-lbl { font-size: 13px; color: #71717a; margin-top: 4px; }
    .section-head {
      display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .project-card {
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 24px;
      background: #ffffff;
    }
    .project-meta { font-size: 12px; color: #71717a; margin-bottom: 8px; }
    .project-card h3 { font-size: 17px; margin-bottom: 8px; }
    .project-card p { font-size: 14px; color: #52525b; }
    footer {
      border-top: 1px solid #e4e4e7;
      padding: 28px 36px;
      font-size: 13px;
      color: #71717a;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    @media (max-width: 960px) {
      .hero { grid-template-columns: 1fr; gap: 28px; }
      .projects-grid { grid-template-columns: repeat(2, 1fr); }
      .metrics { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 680px) {
      header { padding: 14px 20px; }
      .nav-links, .cta-btn { display: none; }
      .menu-toggle { display: inline-block; }
      .container { padding: 28px 20px; }
      .projects-grid { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: 1fr 1fr; gap: 16px; }
    }
  </style>
  ${BRIDGE_SCRIPT}
</head>
<body>
  <header>
    <div class="brand">Verge Studio</div>
    <nav class="nav-links">
      <a href="#works">Selected Works</a>
      <a href="#practice">Practice</a>
      <a href="#materials">Materials</a>
      <a href="#inquiries">Contact</a>
    </nav>
    <button class="cta-btn" onclick="document.getElementById('inquire-msg').textContent = 'Studio prospectus requested — Copenhagen & Zurich offices.'">Commission Inquiry</button>
    <button class="menu-toggle" onclick="document.getElementById('m-drawer').classList.toggle('open')">Menu</button>
  </header>
  <div id="m-drawer" class="mobile-drawer">
    <a href="#works">Selected Works</a>
    <a href="#practice">Practice</a>
    <a href="#materials">Material Research</a>
    <a href="#inquiries">Zurich &amp; Oslo Studios</a>
  </div>
  <main class="container">
    <section class="hero">
      <div>
        <div class="kicker">Zurich · Oslo · Kyoto</div>
        <h1>Cantilevered light, quiet concrete, enduring form.</h1>
        <p class="lead">We design low-impact residential pavilions and public cultural institutions shaped around seasonal daylight and local timber engineering.</p>
        <p id="inquire-msg" style="font-size:13px;color:#0f766e;font-weight:500;"></p>
      </div>
      <div class="hero-media">
        <img src="${pavilionImgUrl}" alt="Cantilevered concrete and glass lake pavilion at golden hour" referrerpolicy="no-referrer" />
      </div>
    </section>

    <section class="metrics">
      <div>
        <div class="metric-val">28</div>
        <div class="metric-lbl">Built Pavilions</div>
      </div>
      <div>
        <div class="metric-val">100%</div>
        <div class="metric-lbl">Mass Timber &amp; Low-Carbon Concrete</div>
      </div>
      <div>
        <div class="metric-val">14 yr</div>
        <div class="metric-lbl">Architectural Monograph</div>
      </div>
      <div>
        <div class="metric-val">3</div>
        <div class="metric-lbl">Nordic Design Awards</div>
      </div>
    </section>

    <section id="works">
      <div class="section-head">
        <h2 style="font-size:22px;letter-spacing:-0.02em;">Recent Commissions</h2>
        <span style="font-size:13px;color:#71717a;">Resize viewport to inspect grid reflow</span>
      </div>
      <div class="projects-grid">
        <article class="project-card">
          <div class="project-meta">01 · Lake Lucerne · 2026</div>
          <h3>Shoreline Glass House</h3>
          <p>Board-formed mineral concrete cantilevering 6.4 meters above alpine water with triple-glazed acoustic facades.</p>
        </article>
        <article class="project-card">
          <div class="project-meta">02 · Aarhus Harbor · 2025</div>
          <h3>Maritime Reading Room</h3>
          <p>Public civic library framed in untreated Douglas fir trusses with clerestory north-facing skylights.</p>
        </article>
        <article class="project-card">
          <div class="project-meta">03 · Karuizawa Forest · 2025</div>
          <h3>Cedar Courtyard Atelier</h3>
          <p>Single-level ceramicist residence organized around a mossy rainwater courtyard and geothermal radiant slab.</p>
        </article>
      </div>
    </section>
  </main>
  <footer>
    <span>© 2026 Verge Studio Architects</span>
    <span>Responsive Breakpoints: 1140px Desktop · 960px Tablet · 680px Mobile</span>
  </footer>
</body>
</html>`,
  },

  'nordic-craft.shop': {
    hostname: 'nordic-craft.shop',
    url: 'https://nordic-craft.shop',
    title: 'Nordic Craft — Atelier',
    description: 'Scandinavian furniture store with interactive cart & mobile-first layout',
    accentColor: '#0f766e',
    getHtml: () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nordic Craft — Copenhagen Furniture Atelier</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #ffffff;
      color: #1c1917;
    }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 32px; border-bottom: 1px solid #e7e5e4;
      position: sticky; top: 0; background: rgba(255,255,255,0.95); z-index: 10;
    }
    .logo { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
    .links { display: flex; gap: 24px; font-size: 14px; color: #57534e; }
    .bag-btn {
      background: #1c1917; color: #fafaf9; border: none; border-radius: 6px;
      padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer;
      font-variant-numeric: tabular-nums;
    }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 40px 32px; }
    .featured {
      display: grid; grid-template-columns: 1.15fr 1fr; gap: 40px; align-items: center;
      margin-bottom: 56px;
    }
    .photo-box {
      border-radius: 10px; overflow: hidden; background: #f5f5f4; aspect-ratio: 4 / 3;
    }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .meta { font-size: 12px; color: #78716c; margin-bottom: 10px; }
    h1 { font-size: clamp(26px, 3.2vw, 40px); line-height: 1.15; margin-bottom: 14px; letter-spacing: -0.02em; }
    .price { font-size: 22px; font-weight: 600; margin-bottom: 16px; font-variant-numeric: tabular-nums; }
    .desc { font-size: 15px; color: #57534e; line-height: 1.6; margin-bottom: 24px; }
    .add-primary {
      background: #1c1917; color: #fff; border: none; border-radius: 8px;
      padding: 12px 22px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .add-primary:hover { background: #292524; }
    .filters { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-btn {
      padding: 7px 14px; font-size: 13px; border: 1px solid #d6d3d1;
      background: #fff; border-radius: 6px; cursor: pointer; color: #44403c;
    }
    .filter-btn.active { background: #1c1917; color: #fff; border-color: #1c1917; }
    .catalog {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    }
    .item {
      border: 1px solid #e7e5e4; border-radius: 8px; padding: 20px;
      display: flex; flex-direction: column; justify-content: space-between; gap: 14px;
    }
    .item-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
    .item h3 { font-size: 16px; font-weight: 600; }
    .item-price { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .item p { font-size: 13px; color: #57534e; line-height: 1.5; }
    .item button {
      align-self: flex-start; padding: 7px 13px; font-size: 12px; font-weight: 600;
      border: 1px solid #1c1917; background: transparent; border-radius: 6px; cursor: pointer;
    }
    @media (max-width: 900px) {
      .featured { grid-template-columns: 1fr; gap: 24px; }
      .catalog { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .topbar { padding: 14px 18px; }
      .links { display: none; }
      .wrap { padding: 24px 18px; }
      .catalog { grid-template-columns: 1fr; }
      .add-primary { width: 100%; }
    }
  </style>
  ${BRIDGE_SCRIPT}
</head>
<body>
  <header class="topbar">
    <div class="logo">Nordic Craft</div>
    <nav class="links">
      <span>Lounge Seating</span>
      <span>Dining Tables</span>
      <span>Lighting</span>
      <span>Joinery Care</span>
    </nav>
    <button id="bag" class="bag-btn" onclick="alertBag()">Bag (1) · $1,480</button>
  </header>
  <main class="wrap">
    <section class="featured">
      <div class="photo-box">
        <img src="${chairImgUrl}" alt="Solid white oak and bouclé lounge chair on travertine stone" referrerpolicy="no-referrer" />
      </div>
      <div>
        <div class="meta">FSC-Certified Solid White Oak · Hand-Oiled in Denmark</div>
        <h1>Solvang Bouclé Lounge Chair</h1>
        <div class="price">$1,480</div>
        <p class="desc">Steam-bent Danish oak armrests paired with heavyweight Norwegian wool bouclé upholstery. Mortise-and-tenon joinery crafted to endure generations.</p>
        <button class="add-primary" onclick="addItem(1480)">Add Lounge Chair to Bag</button>
      </div>
    </section>

    <section>
      <div class="filters">
        <button class="filter-btn active" onclick="filterCat('all', this)">All Pieces</button>
        <button class="filter-btn" onclick="filterCat('seating', this)">Seating</button>
        <button class="filter-btn" onclick="filterCat('stone', this)">Travertine &amp; Timber</button>
      </div>
      <div class="catalog" id="catalog-grid">
        <article class="item" data-cat="stone">
          <div>
            <div class="item-head"><h3>Aalborg Plinth Coffee Table</h3><span class="item-price">$920</span></div>
            <p style="margin-top:8px;">Honed Roman travertine top resting on recessed smoked oak legs.</p>
          </div>
          <button onclick="addItem(920)">Add to Bag</button>
        </article>
        <article class="item" data-cat="seating">
          <div>
            <div class="item-head"><h3>Fjord Woven Dining Chair</h3><span class="item-price">$540</span></div>
            <p style="margin-top:8px;">Natural paper-cord seat hand-woven over soap-finished ash frame.</p>
          </div>
          <button onclick="addItem(540)">Add to Bag</button>
        </article>
        <article class="item" data-cat="stone">
          <div>
            <div class="item-head"><h3>Lyngby Shelving System</h3><span class="item-price">$1,190</span></div>
            <p style="margin-top:8px;">Modular anodized bronze uprights with solid oak book shelves.</p>
          </div>
          <button onclick="addItem(1190)">Add to Bag</button>
        </article>
      </div>
    </section>
  </main>
  <script>
    var count = 1;
    var total = 1480;
    function addItem(price) {
      count += 1;
      total += price;
      document.getElementById('bag').textContent = 'Bag (' + count + ') · $' + total.toLocaleString();
    }
    function alertBag() {
      document.getElementById('bag').textContent = 'Checkout Ready · $' + total.toLocaleString();
    }
    function filterCat(cat, btn) {
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('#catalog-grid .item').forEach(function(card) {
        card.style.display = (cat === 'all' || card.getAttribute('data-cat') === cat) ? 'flex' : 'none';
      });
    }
  </script>
</body>
</html>`,
  },

  'pulse-metrics.io': {
    hostname: 'pulse-metrics.io',
    url: 'https://pulse-metrics.io',
    title: 'Pulse Cloud — Edge Telemetry',
    description: 'Developer infrastructure dashboard with responsive telemetry tables',
    accentColor: '#2563eb',
    getHtml: () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pulse Cloud — Regional Edge Routing Console</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
    }
    .shell { display: grid; grid-template-columns: 230px 1fr; min-height: 100vh; }
    aside {
      border-right: 1px solid #1e293b; padding: 24px 18px; background: #090e1a;
    }
    .brand { font-weight: 700; font-size: 16px; margin-bottom: 28px; color: #f8fafc; }
    .nav-item {
      display: block; width: 100%; text-align: left; background: transparent;
      border: none; color: #94a3b8; padding: 9px 12px; border-radius: 6px;
      font-size: 13px; cursor: pointer; margin-bottom: 4px; font-family: inherit;
    }
    .nav-item.active, .nav-item:hover { background: #1e293b; color: #f8fafc; }
    main { padding: 28px 32px; overflow-x: auto; }
    .top-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 28px; gap: 12px; flex-wrap: wrap;
    }
    h1 { font-size: 22px; font-weight: 600; }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;
    }
    .kpi {
      border: 1px solid #1e293b; background: #131c31; border-radius: 8px; padding: 18px;
    }
    .kpi-lbl { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
    .kpi-val { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th {
      text-align: left; padding: 10px 12px; border-bottom: 1px solid #1e293b;
      color: #94a3b8; font-weight: 500;
    }
    td { padding: 12px; border-bottom: 1px solid #1e293b; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    @media (max-width: 920px) {
      .shell { grid-template-columns: 1fr; }
      aside { display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 12px 16px; border-right: none; border-bottom: 1px solid #1e293b; }
      .brand { margin-bottom: 0; margin-right: 12px; white-space: nowrap; }
      .nav-item { width: auto; white-space: nowrap; margin-bottom: 0; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      main { padding: 18px 16px; }
      .kpi-grid { grid-template-columns: 1fr; }
    }
  </style>
  ${BRIDGE_SCRIPT}
</head>
<body>
  <div class="shell">
    <aside>
      <div class="brand">Pulse Cloud</div>
      <button class="nav-item active">Edge Regions</button>
      <button class="nav-item">Deployments</button>
      <button class="nav-item">KV Storage</button>
      <button class="nav-item">TLS Certificates</button>
    </aside>
    <main>
      <div class="top-row">
        <div>
          <h1>Global Edge Traffic</h1>
          <p style="font-size:13px;color:#94a3b8;margin-top:2px;">Window: Last 60 minutes · Adaptive sidebar collapses below 920px</p>
        </div>
        <button onclick="refreshStats()" style="background:#2563eb;color:#fff;border:none;padding:8px 14px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;">Refresh Window</button>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-lbl">Requests / sec</div><div id="rps" class="kpi-val">48,920</div></div>
        <div class="kpi"><div class="kpi-lbl">Median P50</div><div class="kpi-val">11.4 ms</div></div>
        <div class="kpi"><div class="kpi-lbl">Cache Hit Ratio</div><div class="kpi-val">98.7%</div></div>
        <div class="kpi"><div class="kpi-lbl">TLS 1.3 Handshake</div><div class="kpi-val">4.2 ms</div></div>
      </div>
      <div style="border:1px solid #1e293b;border-radius:8px;overflow-x:auto;">
        <table>
          <thead>
            <tr><th>Region Cluster</th><th>City</th><th>Throughput</th><th>P95 Latency</th><th>State</th></tr>
          </thead>
          <tbody>
            <tr><td class="mono">eu-west-fra</td><td>Frankfurt</td><td class="mono">16,410 req/s</td><td class="mono">14.2 ms</td><td style="color:#4ade80;">Nominal</td></tr>
            <tr><td class="mono">us-east-iad</td><td>Ashburn</td><td class="mono">19,080 req/s</td><td class="mono">16.8 ms</td><td style="color:#4ade80;">Nominal</td></tr>
            <tr><td class="mono">ap-northeast-hnd</td><td>Tokyo</td><td class="mono">9,240 req/s</td><td class="mono">19.1 ms</td><td style="color:#4ade80;">Nominal</td></tr>
            <tr><td class="mono">eu-north-arn</td><td>Stockholm</td><td class="mono">4,190 req/s</td><td class="mono">12.6 ms</td><td style="color:#4ade80;">Nominal</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
  <script>
    function refreshStats() {
      var next = 47000 + Math.floor(Math.random() * 4500);
      document.getElementById('rps').textContent = next.toLocaleString();
    }
  </script>
</body>
</html>`,
  },

  'meridian-dispatch.org': {
    hostname: 'meridian-dispatch.org',
    url: 'https://meridian-dispatch.org',
    title: 'The Meridian Dispatch',
    description: 'Editorial science & technology broadsheet with multi-column responsive reflow',
    accentColor: '#be123c',
    getHtml: () => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Meridian Dispatch — Science &amp; Design Broadsheet</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: #fdfdfc;
      color: #171717;
      line-height: 1.65;
    }
    .masthead {
      text-align: center;
      padding: 28px 20px 20px;
      border-bottom: 1px solid #d4d4d4;
    }
    .paper-title {
      font-family: Georgia, serif;
      font-size: clamp(28px, 4vw, 48px);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .edition-bar {
      font-size: 12px; color: #525252; margin-top: 6px;
    }
    .broadsheet {
      max-width: 1120px; margin: 0 auto; padding: 36px 28px;
      display: grid; grid-template-columns: 1.8fr 1fr 1fr; gap: 32px;
    }
    .col { border-right: 1px solid #e5e5e5; padding-right: 28px; }
    .col:last-child { border-right: none; padding-right: 0; }
    .kicker { font-size: 12px; color: #737373; margin-bottom: 8px; }
    h1 { font-family: Georgia, serif; font-size: 30px; line-height: 1.2; margin-bottom: 14px; }
    h2 { font-family: Georgia, serif; font-size: 20px; line-height: 1.28; margin-bottom: 10px; }
    p { font-size: 15px; color: #404040; margin-bottom: 14px; }
    @media (max-width: 900px) {
      .broadsheet { grid-template-columns: 1.4fr 1fr; }
      .col:nth-child(2) { border-right: none; padding-right: 0; }
      .col:last-child { grid-column: 1 / -1; border-top: 1px solid #e5e5e5; padding-top: 24px; }
    }
    @media (max-width: 640px) {
      .broadsheet { grid-template-columns: 1fr; gap: 24px; padding: 24px 18px; }
      .col { border-right: none; padding-right: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
    }
  </style>
  ${BRIDGE_SCRIPT}
</head>
<body>
  <header class="masthead">
    <div class="paper-title">The Meridian Dispatch</div>
    <div class="edition-bar">Friday, October 30, 2026 · International Science, Architecture &amp; Web Engineering Edition</div>
  </header>
  <main class="broadsheet">
    <article class="col">
      <div class="kicker">Deep Space Optics · Lead Essay</div>
      <h1>Next-Generation Segmented Mirrors Prepare for Exoplanet Spectroscopy</h1>
      <p>Engineers in Atacama and Munich have completed sub-nanometer phasing trials on eighteen hexagonal silicon-carbide mirror segments, paving the way for direct atmospheric imaging of temperate rocky worlds.</p>
      <p>By pairing adaptive wavefront sensors with lightweight acoustic actuators, the array compensates for thermal drift across rapid desert temperature drops.</p>
    </article>
    <article class="col">
      <div class="kicker">Web Architecture · Standards</div>
      <h2>Why Fluid Viewport Mechanics Still Anchor Modern Interface Craft</h2>
      <p>Fifteen years after Ethan Marcotte coined responsive web design, intrinsic layout primitives, CSS Grid, and container queries allow single codebases to span pocket screens and 27-inch studio monitors without compromise.</p>
    </article>
    <article class="col">
      <div class="kicker">Urban Ecology · Copenhagen</div>
      <h2>Timber Harbor Baths Reopen Ahead of Winter Solstice</h2>
      <p>Constructed from untreated Nordic larch with solar-heated changing pavilions, the expanded waterfront pier welcomes year-round cold-water swimmers.</p>
    </article>
  </main>
</body>
</html>`,
  },
};

export function findShowcaseSiteByUrl(rawUrl: string): ShowcaseSite | null {
  try {
    const parsed = new URL(rawUrl);
    const cleanHost = parsed.hostname.replace(/^www\./, '').toLowerCase();
    return SHOWCASE_SITES[cleanHost] ?? null;
  } catch {
    return null;
  }
}
