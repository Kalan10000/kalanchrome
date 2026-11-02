import React, { useState } from 'react';
import { Search, Compass, ArrowUpRight, Smartphone } from 'lucide-react';

interface ShortcutSite {
  title: string;
  subtitle: string;
  url: string;
  monogram: string;
  bgClass: string;
}

const PINNED_SHORTCUTS: ShortcutSite[] = [
  {
    title: 'Verge Studio',
    subtitle: 'Architecture',
    url: 'https://verge-studio.design',
    monogram: 'V',
    bgClass: 'bg-amber-600 text-white',
  },
  {
    title: 'Nordic Craft',
    subtitle: 'Furniture Shop',
    url: 'https://nordic-craft.shop',
    monogram: 'N',
    bgClass: 'bg-teal-700 text-white',
  },
  {
    title: 'Pulse Cloud',
    subtitle: 'Edge Console',
    url: 'https://pulse-metrics.io',
    monogram: 'P',
    bgClass: 'bg-blue-600 text-white',
  },
  {
    title: 'Meridian',
    subtitle: 'Broadsheet',
    url: 'https://meridian-dispatch.org',
    monogram: 'M',
    bgClass: 'bg-rose-700 text-white',
  },
  {
    title: 'Wikipedia',
    subtitle: 'Encyclopedia',
    url: 'https://en.wikipedia.org/wiki/Responsive_web_design',
    monogram: 'W',
    bgClass: 'bg-slate-800 text-white font-serif',
  },
  {
    title: 'Hacker News',
    subtitle: 'Tech Links',
    url: 'https://news.ycombinator.com',
    monogram: 'Y',
    bgClass: 'bg-orange-600 text-white',
  },
];

const SUGGESTED_QUERIES = [
  'responsive web design',
  'modernist concrete architecture',
  'james webb space telescope',
  'typescript compiler internals',
];

interface NewTabPageProps {
  chromeDark: boolean;
  isResponsiveMode: boolean;
  onSubmitInput: (rawInput: string) => void;
  onNavigateUrl: (url: string) => void;
  onToggleResponsive: () => void;
}

export function NewTabPage({
  chromeDark,
  isResponsiveMode,
  onSubmitInput,
  onNavigateUrl,
  onToggleResponsive,
}: NewTabPageProps) {
  const [query, setQuery] = useState('');
  const [validationHint, setValidationHint] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setValidationHint(true);
      return;
    }
    setValidationHint(false);
    onSubmitInput(query);
  };

  return (
    <div
      className={`@container w-full h-full overflow-y-auto flex flex-col justify-between ${
        chromeDark ? 'bg-[#202124] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top Quick Links inside New Tab */}
      <div className="flex items-center justify-end gap-5 px-5 py-3.5 text-xs">
        <button
          type="button"
          onClick={() => onNavigateUrl('https://www.google.com/search?q=responsive+web+design')}
          className={`hover:underline cursor-pointer ${
            chromeDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          Search Index
        </button>
        <button
          type="button"
          onClick={() => onNavigateUrl('chrome://bookmarks')}
          className={`hover:underline cursor-pointer ${
            chromeDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          Bookmarks
        </button>
        <button
          type="button"
          onClick={onToggleResponsive}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium border transition-colors cursor-pointer ${
            isResponsiveMode
              ? 'bg-blue-600 text-white border-blue-600'
              : chromeDark
              ? 'border-[#3c4043] text-slate-200 hover:bg-white/5'
              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isResponsiveMode ? 'Responsive Active' : 'Inspect Responsivity'}</span>
        </button>
      </div>

      {/* Center Google Wordmark + Search Box + Pinned Sites */}
      <main className="w-full max-w-3xl mx-auto px-5 py-6 my-auto flex flex-col items-center">
        {/* Authentic Multi-Color Google Wordmark */}
        <h1
          aria-label="Google"
          className="text-5xl @sm:text-6xl font-bold tracking-tight select-none mb-7"
        >
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </h1>

        <form onSubmit={handleSearch} className="w-full max-w-xl mb-7">
          <div
            className={`flex items-center h-12 rounded-full px-4 gap-3 border transition-shadow ${
              chromeDark
                ? 'bg-[#303134] border-[#5f6368] focus-within:bg-[#303134] focus-within:shadow-lg focus-within:border-slate-400'
                : 'bg-white border-slate-200 shadow-xs hover:shadow-md focus-within:shadow-md focus-within:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationHint && e.target.value.trim()) {
                  setValidationHint(false);
                }
              }}
              placeholder="Search Google or type a website URL"
              aria-label="Search Google or type a website URL"
              className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${
                chromeDark
                  ? 'text-slate-100 placeholder:text-slate-400'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {query.trim().length > 0 && (
              <button
                type="submit"
                className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            )}
          </div>

          {validationHint && (
            <p role="alert" className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
              Enter a search topic or website address (such as verge-studio.design) to continue.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                chromeDark
                  ? 'bg-[#303134] hover:bg-[#3c4043] text-slate-200 border border-transparent hover:border-[#5f6368]'
                  : 'bg-[#f8f9fa] hover:bg-[#f1f3f4] text-slate-700 border border-transparent hover:border-slate-200'
              }`}
            >
              Google Search
            </button>
            <button
              type="button"
              onClick={() => onNavigateUrl('https://verge-studio.design')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                chromeDark
                  ? 'bg-[#303134] hover:bg-[#3c4043] text-slate-200 border border-transparent hover:border-[#5f6368]'
                  : 'bg-[#f8f9fa] hover:bg-[#f1f3f4] text-slate-700 border border-transparent hover:border-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Open Responsive Showcase</span>
            </button>
          </div>
        </form>

        {/* Pinned Websites Grid — Reflows via @container queries when responsive viewport resizes! */}
        <section aria-label="Pinned websites" className="w-full mb-8">
          <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-6 gap-2.5">
            {PINNED_SHORTCUTS.map((site) => (
              <button
                key={site.url}
                type="button"
                onClick={() => onNavigateUrl(site.url)}
                className={`group flex flex-col items-center p-3 rounded-xl transition-colors cursor-pointer ${
                  chromeDark ? 'hover:bg-white/5' : 'hover:bg-slate-100/90'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold mb-2 shadow-xs transition-transform duration-150 group-hover:scale-105 ${site.bgClass}`}
                >
                  {site.monogram}
                </div>
                <span className="text-xs font-medium truncate max-w-full">
                  {site.title}
                </span>
                <span
                  className={`text-[11px] truncate max-w-full ${
                    chromeDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {site.subtitle}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Trending Google Queries */}
        <section aria-label="Try searching Google" className="w-full max-w-lg">
          <div
            className={`text-[11px] font-medium mb-2 text-center ${
              chromeDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Try live Google searches
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSubmitInput(q)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border transition-colors cursor-pointer ${
                  chromeDark
                    ? 'border-[#3c4043] bg-[#292a2d] hover:bg-[#35363a] text-slate-300'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{q}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer
        className={`px-5 py-3 text-xs border-t flex flex-wrap items-center justify-between gap-2 ${
          chromeDark
            ? 'bg-[#171717] border-[#303134] text-slate-400'
            : 'bg-[#f2f2f2] border-slate-200 text-slate-600'
        }`}
      >
        <span>Google Chrome Workspace · Live Search &amp; Responsive Inspector</span>
        <span>Tip: Toggle Responsive in the toolbar to test mobile &amp; tablet layouts</span>
      </footer>
    </div>
  );
}
