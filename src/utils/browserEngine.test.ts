import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOmniboxInput,
  extractGoogleSearchQuery,
  createBrowserTab,
  navigateTab,
  stepTabHistory,
  getCssBreakpointBadge,
  computeResponsiveScale,
  clampViewportDimension,
} from './browserEngine';

test('parseOmniboxInput rejects empty or whitespace-only queries', () => {
  assert.equal(parseOmniboxInput(''), null);
  assert.equal(parseOmniboxInput('    '), null);
});

test('parseOmniboxInput routes natural search queries to Google Search', () => {
  const parsed = parseOmniboxInput('responsive web design media queries');
  assert.deepEqual(parsed, {
    kind: 'search',
    url: 'https://www.google.com/search?q=responsive+web+design+media+queries',
    query: 'responsive web design media queries',
  });
});

test('parseOmniboxInput recognizes bare domains and full https URLs', () => {
  const bare = parseOmniboxInput('verge-studio.design');
  assert.deepEqual(bare, {
    kind: 'url',
    url: 'https://verge-studio.design',
  });

  const deepPath = parseOmniboxInput('en.wikipedia.org/wiki/Responsive_web_design');
  assert.deepEqual(deepPath, {
    kind: 'url',
    url: 'https://en.wikipedia.org/wiki/Responsive_web_design',
  });

  const full = parseOmniboxInput('https://pulse-metrics.io/docs');
  assert.deepEqual(full, {
    kind: 'url',
    url: 'https://pulse-metrics.io/docs',
  });
});

test('parseOmniboxInput recognizes internal chrome:// pages', () => {
  assert.deepEqual(parseOmniboxInput('chrome://history'), {
    kind: 'internal',
    url: 'chrome://history',
  });
  assert.deepEqual(parseOmniboxInput('chrome://bookmarks'), {
    kind: 'internal',
    url: 'chrome://bookmarks',
  });
});

test('extractGoogleSearchQuery extracts q param only on Google search URLs', () => {
  assert.equal(
    extractGoogleSearchQuery('https://www.google.com/search?q=scandinavian+oak'),
    'scandinavian oak'
  );
  assert.equal(extractGoogleSearchQuery('https://verge-studio.design'), null);
});

test('tab history navigation supports push, back, forward, and branch truncation', () => {
  let tab = createBrowserTab('t1', 'chrome://newtab');
  tab = navigateTab(tab, 'https://www.google.com/search?q=architecture');
  tab = navigateTab(tab, 'https://verge-studio.design');

  assert.equal(tab.history.length, 3);
  assert.equal(tab.historyIndex, 2);
  assert.equal(tab.url, 'https://verge-studio.design');

  tab = stepTabHistory(tab, -1);
  assert.equal(tab.historyIndex, 1);
  assert.equal(tab.url, 'https://www.google.com/search?q=architecture');

  // Navigating from a back-stepped position truncates forward history
  tab = navigateTab(tab, 'https://nordic-craft.shop');
  assert.deepEqual(tab.history, [
    'chrome://newtab',
    'https://www.google.com/search?q=architecture',
    'https://nordic-craft.shop',
  ]);
  assert.equal(tab.historyIndex, 2);
});

test('responsive scale and CSS breakpoint calculation behave accurately', () => {
  assert.equal(getCssBreakpointBadge(390).code, 'xs (<480px)');
  assert.equal(getCssBreakpointBadge(768).code, 'md (768–1023px)');
  assert.equal(getCssBreakpointBadge(1360).code, 'xl (≥1280px)');

  // Fits without scaling when container is larger than target
  assert.equal(computeResponsiveScale(390, 600, 1200, 800, 'auto'), 1);

  // Scales down proportionally when target exceeds container
  const scaled = computeResponsiveScale(1440, 900, 800, 600, 'auto');
  assert.ok(scaled < 1 && scaled >= 0.25);

  // Explicit zoom overrides auto-fit
  assert.equal(computeResponsiveScale(1440, 900, 800, 600, 75), 0.75);
  assert.equal(clampViewportDimension(180, 280, 2560), 280);
});
