import React, { useEffect, useState } from 'react';
import { Search, ExternalLink, Globe, X } from 'lucide-react';

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

interface GoogleSearchResultsProps {
  query: string;
  chromeDark: boolean;
  reloadNonce: number;
  onSearchQuery: (nextQuery: string) => void;
  onOpenWebsite: (url: string, inNewTab?: boolean) => void;
  onLoadComplete: () => void;
}

export function GoogleSearchResults({
  query,
  chromeDark,
  reloadNonce,
  onSearchQuery,
  onOpenWebsite,
  onLoadComplete,
}: GoogleSearchResultsProps) {
  const [boxValue, setBoxValue] = useState(query);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'engineering' | 'design' | 'news'
  >('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgePanel | null>(null);
  const [tookMs, setTookMs] = useState<number>(38);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setBoxValue(query);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error(`Search HTTP ${res.status}`);
        }
        const data = (await res.json()) as {
          results: SearchResultItem[];
          knowledge: KnowledgePanel | null;
          tookMs: number;
        };
        if (!cancelled) {
          setResults(data.results || []);
          setKnowledge(data.knowledge || null);
          setTookMs(data.tookMs || 42);
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('Unable to reach live search service. Showing offline directory.');
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          onLoadComplete();
        }
      }
    }
    runSearch();
    return () => {
      cancelled = true;
    };
  }, [query, reloadNonce]);

  const filteredResults =
    activeCategory === 'all'
      ? results
      : results.filter(
          (r) => r.category === activeCategory || r.category === 'all'
        );

  const handleReSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boxValue.trim()) return;
    onSearchQuery(boxValue.trim());
  };

  const relatedQueries = [
    `${query} architecture`,
    `${query} documentation`,
    `${query} examples`,
    'responsive css container queries',
  ];

  return (
    <div
      className={`@container w-full h-full overflow-y-auto ${
        chromeDark ? 'bg-[#202124] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Google SERP Header */}
      <header
        className={`sticky top-0 z-10 border-b px-4 @md:px-8 pt-4 ${
          chromeDark
            ? 'bg-[#202124]/95 border-[#3c4043]'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="flex flex-col @md:flex-row @md:items-center gap-3 @md:gap-7 max-w-5xl">
          <button
            type="button"
            onClick={() => onOpenWebsite('chrome://newtab')}
            aria-label="Google Home"
            className="text-2xl font-bold tracking-tight text-left shrink-0 cursor-pointer"
          >
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </button>

          <form onSubmit={handleReSearch} className="flex-1 max-w-2xl">
            <div
              className={`flex items-center h-11 rounded-full px-4 gap-2.5 border ${
                chromeDark
                  ? 'bg-[#303134] border-[#5f6368] text-slate-100'
                  : 'bg-white border-slate-200 shadow-xs text-slate-900'
              }`}
            >
              <input
                type="text"
                value={boxValue}
                onChange={(e) => setBoxValue(e.target.value)}
                aria-label="Google search query"
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
              />
              {boxValue && (
                <button
                  type="button"
                  onClick={() => setBoxValue('')}
                  aria-label="Clear search box"
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Submit Google search"
                className="p-1.5 text-blue-500 hover:text-blue-600 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Search result categories"
          className="flex items-center gap-5 mt-3 @md:ml-[106px] text-xs font-medium overflow-x-auto no-scrollbar"
        >
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'design', label: 'Design & Showcases' },
              { id: 'engineering', label: 'Engineering' },
              { id: 'news', label: 'Articles' },
            ] as const
          ).map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(tab.id)}
                className={`pb-2.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main SERP Body */}
      <main className="px-4 @md:px-8 @md:ml-[106px] py-5 max-w-5xl">
        {/* Stats Line — Tabular Numerals, Clean Unboxed Text */}
        {!loading && (
          <div
            className={`text-xs mb-5 tabular-nums ${
              chromeDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Showing {filteredResults.length} web results ({(tookMs / 1000).toFixed(2)} seconds)
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="space-y-6 max-w-xl" aria-label="Loading search results">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="space-y-2 animate-pulse">
                <div className="h-3.5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-5 w-80 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 @lg:grid-cols-[minmax(0,1fr)_300px] gap-10 items-start">
            {/* Organic Search Results Column */}
            <div className="space-y-7 min-w-0">
              {filteredResults.length === 0 ? (
                <div className="py-8">
                  <p className="text-sm font-medium mb-2">
                    No results matched the selected category filter for &ldquo;{query}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Reset filter to view all results
                  </button>
                </div>
              ) : (
                filteredResults.map((item) => (
                  <article key={item.url} className="group max-w-2xl">
                    {/* Site Attribution & Clean Breadcrumb */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => onOpenWebsite(item.url, false)}
                        className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                      >
                        <span
                          aria-hidden="true"
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                            chromeDark
                              ? 'bg-[#303134] border-[#494c50] text-slate-200'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-medium leading-tight truncate">
                            {item.source}
                          </span>
                          <span
                            className={`block text-[11px] truncate ${
                              chromeDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {item.displayUrl}
                          </span>
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenWebsite(item.url, true)}
                        aria-label={`Open ${item.title} in new tab`}
                        title="Open in new Chrome tab"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] opacity-80 hover:opacity-100 transition-colors shrink-0 cursor-pointer ${
                          chromeDark
                            ? 'hover:bg-white/10 text-slate-400 hover:text-slate-100'
                            : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden @sm:inline">New Tab</span>
                      </button>
                    </div>

                    {/* Result Title Link */}
                    <h2 className="text-lg font-medium leading-snug mb-1">
                      <button
                        type="button"
                        onClick={() => onOpenWebsite(item.url, false)}
                        className={`text-left hover:underline cursor-pointer ${
                          chromeDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                        }`}
                      >
                        {item.title}
                      </button>
                    </h2>

                    {/* Snippet + Unboxed Date Metadata */}
                    <p
                      className={`text-sm leading-relaxed ${
                        chromeDark ? 'text-[#bdc1c6]' : 'text-[#4d5156]'
                      }`}
                    >
                      {item.publishedAt && (
                        <span
                          className={
                            chromeDark ? 'text-slate-400' : 'text-slate-500'
                          }
                        >
                          {item.publishedAt}
                          <span aria-hidden="true"> · </span>
                        </span>
                      )}
                      {item.snippet}
                    </p>
                  </article>
                ))
              )}

              {/* Related Searches */}
              <section className="pt-4 border-t border-slate-200 dark:border-[#3c4043] max-w-2xl">
                <h3 className="text-sm font-medium mb-3">Related searches</h3>
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-2">
                  {relatedQueries.map((rq) => (
                    <button
                      key={rq}
                      type="button"
                      onClick={() => onSearchQuery(rq)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        chromeDark
                          ? 'bg-[#303134] hover:bg-[#3c4043] text-slate-200'
                          : 'bg-[#f1f3f4] hover:bg-[#e8eaed] text-slate-800'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="truncate font-medium">{rq}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Wikipedia Knowledge Graph Card */}
            {knowledge && (
              <aside
                aria-label="Knowledge summary"
                className={`rounded-xl border p-5 ${
                  chromeDark
                    ? 'border-[#3c4043] bg-[#292a2d]'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {knowledge.thumbnailUrl && (
                  <div className="mb-3.5 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 max-h-44">
                    <img
                      src={knowledge.thumbnailUrl}
                      alt={knowledge.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold leading-tight">
                  {knowledge.title}
                </h3>
                {knowledge.subtitle && (
                  <p
                    className={`text-xs mt-1 ${
                      chromeDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {knowledge.subtitle}
                  </p>
                )}
                <p
                  className={`text-xs leading-relaxed mt-3 ${
                    chromeDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {knowledge.extract}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenWebsite(knowledge.url, false)}
                  className={`mt-4 inline-flex items-center gap-1.5 text-xs font-medium hover:underline cursor-pointer ${
                    chromeDark ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'
                  }`}
                >
                  <span>Read full article on Wikipedia</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </aside>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
