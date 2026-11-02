import React, { useState } from 'react';
import { Clock, Bookmark, Trash2, Plus, Globe, Search } from 'lucide-react';
import type { BookmarkItem } from '../utils/browserEngine';

export interface HistoryLogEntry {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
}

interface ChromeInternalPagesProps {
  route: 'chrome://history' | 'chrome://bookmarks';
  chromeDark: boolean;
  historyEntries: HistoryLogEntry[];
  bookmarks: BookmarkItem[];
  onOpenUrl: (url: string) => void;
  onClearHistory: () => void;
  onAddBookmark: (title: string, url: string) => void;
  onRemoveBookmark: (id: string) => void;
}

export function ChromeInternalPages({
  route,
  chromeDark,
  historyEntries,
  bookmarks,
  onOpenUrl,
  onClearHistory,
  onAddBookmark,
  onRemoveBookmark,
}: ChromeInternalPagesProps) {
  const [filterText, setFilterText] = useState('');
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmUrl, setNewBmUrl] = useState('');
  const [bmError, setBmError] = useState<string | null>(null);

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newBmTitle.trim();
    const cleanUrl = newBmUrl.trim();
    if (!cleanTitle || !cleanUrl) {
      setBmError('Provide both a bookmark name and website address.');
      return;
    }
    const normalized =
      cleanUrl.startsWith('http://') ||
      cleanUrl.startsWith('https://') ||
      cleanUrl.startsWith('chrome://')
        ? cleanUrl
        : `https://${cleanUrl}`;
    onAddBookmark(cleanTitle, normalized);
    setNewBmTitle('');
    setNewBmUrl('');
    setBmError(null);
  };

  if (route === 'chrome://history') {
    const filtered = historyEntries.filter(
      (item) =>
        item.title.toLowerCase().includes(filterText.toLowerCase()) ||
        item.url.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
      <div
        className={`w-full h-full overflow-y-auto p-6 sm:p-10 ${
          chromeDark ? 'bg-[#202124] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-blue-500" />
              <h1 className="text-xl font-semibold">Browsing History</h1>
            </div>
            {historyEntries.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Browsing Data</span>
              </button>
            )}
          </div>

          <div
            className={`flex items-center gap-2.5 px-3.5 h-10 rounded-lg border mb-6 ${
              chromeDark
                ? 'bg-[#292a2d] border-[#3c4043]'
                : 'bg-white border-slate-200'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search browsing history"
              aria-label="Search browsing history"
              className="flex-1 bg-transparent text-xs focus:outline-none"
            />
          </div>

          <div
            className={`rounded-xl border divide-y ${
              chromeDark
                ? 'bg-[#292a2d] border-[#3c4043] divide-[#3c4043]'
                : 'bg-white border-slate-200 divide-slate-100'
            }`}
          >
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No history entries recorded yet. Search Google or visit a website to populate history.
              </div>
            ) : (
              filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-xs"
                >
                  <button
                    type="button"
                    onClick={() => onOpenUrl(entry.url)}
                    className="flex items-center gap-3 min-w-0 text-left hover:underline cursor-pointer"
                  >
                    <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
                      {entry.visitedAt}
                    </span>
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{entry.title}</span>
                    <span className="text-slate-400 truncate hidden sm:inline">
                      {entry.url}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full overflow-y-auto p-6 sm:p-10 ${
        chromeDark ? 'bg-[#202124] text-slate-100' : 'bg-[#f8f9fa] text-slate-900'
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5 mb-6">
          <Bookmark className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-semibold">Bookmarks Manager</h1>
        </div>

        {/* Add Bookmark Form */}
        <form
          onSubmit={handleCreateBookmark}
          className={`rounded-xl border p-4 mb-6 ${
            chromeDark ? 'bg-[#292a2d] border-[#3c4043]' : 'bg-white border-slate-200'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
            <input
              type="text"
              value={newBmTitle}
              onChange={(e) => setNewBmTitle(e.target.value)}
              placeholder="Site title (e.g. MDN Web Docs)"
              aria-label="Bookmark title"
              className={`px-3 py-2 rounded-md border text-xs focus:outline-none ${
                chromeDark
                  ? 'bg-[#202124] border-[#494c50] text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
            <input
              type="text"
              value={newBmUrl}
              onChange={(e) => setNewBmUrl(e.target.value)}
              placeholder="Website URL (e.g. developer.mozilla.org)"
              aria-label="Bookmark URL"
              className={`px-3 py-2 rounded-md border text-xs focus:outline-none ${
                chromeDark
                  ? 'bg-[#202124] border-[#494c50] text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bookmark</span>
            </button>
          </div>
          {bmError && (
            <p role="alert" className="text-xs text-rose-500 mt-2">
              {bmError}
            </p>
          )}
        </form>

        <div
          className={`rounded-xl border divide-y ${
            chromeDark
              ? 'bg-[#292a2d] border-[#3c4043] divide-[#3c4043]'
              : 'bg-white border-slate-200 divide-slate-100'
          }`}
        >
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="flex items-center justify-between gap-4 px-4 py-3 text-xs"
            >
              <button
                type="button"
                onClick={() => onOpenUrl(bm.url)}
                className="flex items-center gap-3 min-w-0 text-left hover:underline cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium truncate">{bm.title}</span>
                <span className="text-slate-400 truncate hidden sm:inline">
                  {bm.url}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemoveBookmark(bm.id)}
                aria-label={`Delete bookmark ${bm.title}`}
                className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
