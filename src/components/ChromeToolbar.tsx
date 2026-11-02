import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Lock,
  Search,
  Star,
  Smartphone,
  MoreVertical,
  X,
  Globe,
  Moon,
  Sun,
  Clock,
  Bookmark,
  Monitor,
  Plus,
} from 'lucide-react';
import type { BookmarkItem, BrowserTab } from '../utils/browserEngine';

interface ChromeToolbarProps {
  activeTab: BrowserTab;
  chromeDark: boolean;
  isResponsiveMode: boolean;
  showBookmarksBar: boolean;
  bookmarks: BookmarkItem[];
  monitorFramed: boolean;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onNavigateInput: (rawInput: string) => void;
  onNavigateUrl: (url: string) => void;
  onToggleBookmark: () => void;
  onToggleResponsiveMode: () => void;
  onToggleChromeDark: () => void;
  onToggleBookmarksBar: () => void;
  onToggleMonitorFrame: () => void;
  onNewTab: () => void;
}

export function ChromeToolbar({
  activeTab,
  chromeDark,
  isResponsiveMode,
  showBookmarksBar,
  bookmarks,
  monitorFramed,
  onBack,
  onForward,
  onReload,
  onHome,
  onNavigateInput,
  onNavigateUrl,
  onToggleBookmark,
  onToggleResponsiveMode,
  onToggleChromeDark,
  onToggleBookmarksBar,
  onToggleMonitorFrame,
  onNewTab,
}: ChromeToolbarProps) {
  const displayValueForTab =
    activeTab.url === 'chrome://newtab' ? '' : activeTab.url;
  const [inputVal, setInputVal] = useState(displayValueForTab);
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputVal(activeTab.url === 'chrome://newtab' ? '' : activeTab.url);
    }
  }, [activeTab.url, activeTab.id, isFocused]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [menuOpen]);

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;
  const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);
  const isSecureHttps = activeTab.url.startsWith('https://');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onNavigateInput(inputVal);
    inputRef.current?.blur();
  };

  return (
    <div
      className={`shrink-0 border-b ${
        chromeDark
          ? 'bg-[#323639] border-[#494c50] text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Main Omnibox Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 h-11">
        {/* Back / Forward / Reload / Home */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Go back"
            className={`p-1.5 rounded-full transition-colors ${
              canGoBack
                ? chromeDark
                  ? 'hover:bg-white/10 text-slate-200 cursor-pointer'
                  : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                : 'opacity-35 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onForward}
            disabled={!canGoForward}
            aria-label="Go forward"
            className={`p-1.5 rounded-full transition-colors ${
              canGoForward
                ? chromeDark
                  ? 'hover:bg-white/10 text-slate-200 cursor-pointer'
                  : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                : 'opacity-35 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onReload}
            aria-label="Reload current page"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              chromeDark
                ? 'hover:bg-white/10 text-slate-200'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RotateCw
              className={`w-4 h-4 ${activeTab.isLoading ? 'animate-spin text-blue-500' : ''}`}
            />
          </button>
          <button
            type="button"
            onClick={onHome}
            aria-label="Go to New Tab home"
            className={`hidden sm:inline-flex p-1.5 rounded-full transition-colors cursor-pointer ${
              chromeDark
                ? 'hover:bg-white/10 text-slate-200'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 relative">
          <div
            className={`flex items-center h-8 rounded-full px-3 gap-2 transition-colors border ${
              isFocused
                ? chromeDark
                  ? 'bg-[#202124] border-blue-400 ring-2 ring-blue-500/25'
                  : 'bg-white border-blue-600 ring-2 ring-blue-500/20'
                : chromeDark
                ? 'bg-[#202124] border-transparent hover:bg-[#28292c]'
                : 'bg-[#f1f3f4] border-transparent hover:bg-[#e8eaed]'
            }`}
          >
            <button
              type="button"
              onClick={() => setSecurityOpen((v) => !v)}
              aria-label="View site connection details"
              className={`p-1 rounded-full shrink-0 cursor-pointer ${
                chromeDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {activeTab.url === 'chrome://newtab' ? (
                <Search className="w-3.5 h-3.5" />
              ) : isSecureHttps ? (
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Globe className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onFocus={(e) => {
                setIsFocused(true);
                e.currentTarget.select();
              }}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search Google or type a URL"
              aria-label="Address and search bar"
              className={`flex-1 min-w-0 bg-transparent text-xs sm:text-[13px] focus:outline-none ${
                chromeDark
                  ? 'text-slate-100 placeholder:text-slate-400'
                  : 'text-slate-900 placeholder:text-slate-500'
              }`}
            />

            {inputVal && isFocused && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputVal('');
                }}
                aria-label="Clear address bar"
                className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {activeTab.url !== 'chrome://newtab' && (
              <button
                type="button"
                onClick={onToggleBookmark}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
                title={isBookmarked ? 'Bookmarked' : 'Bookmark this tab'}
                className="p-1 rounded-full hover:bg-black/5 cursor-pointer shrink-0"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isBookmarked
                      ? 'fill-blue-600 text-blue-600'
                      : chromeDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                />
              </button>
            )}
          </div>

          {securityOpen && (
            <div
              className={`absolute left-0 top-10 z-30 w-72 rounded-lg border p-3.5 shadow-lg text-xs ${
                chromeDark
                  ? 'bg-[#292a2d] border-[#494c50] text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold">
                  {isSecureHttps ? 'Connection is secure' : 'Chrome Internal Page'}
                </span>
                <button
                  type="button"
                  onClick={() => setSecurityOpen(false)}
                  aria-label="Close connection info"
                  className="p-0.5 rounded hover:bg-black/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] leading-relaxed opacity-80 break-all">
                {activeTab.url}
              </p>
            </div>
          )}
        </form>

        {/* Responsive Device Mode Toggle & Chrome Menu */}
        <div className="flex items-center gap-1 shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={onToggleResponsiveMode}
            aria-label="Toggle responsive device toolbar"
            aria-pressed={isResponsiveMode}
            title="Toggle Responsive Viewport Mode"
            className={`inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isResponsiveMode
                ? 'bg-blue-600 text-white shadow-xs'
                : chromeDark
                ? 'bg-[#202124] hover:bg-white/10 text-slate-200'
                : 'bg-[#f1f3f4] hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Responsive</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Customize and control Google Chrome"
              aria-expanded={menuOpen}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                chromeDark
                  ? 'hover:bg-white/10 text-slate-200'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className={`absolute right-0 top-10 z-40 w-60 rounded-lg border py-1.5 shadow-xl text-xs ${
                  chromeDark
                    ? 'bg-[#292a2d] border-[#494c50] text-slate-100'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onNewTab();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Tab</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onNavigateUrl('chrome://history');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onNavigateUrl('chrome://bookmarks');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks Manager</span>
                </button>
                <div
                  className={`my-1 border-t ${
                    chromeDark ? 'border-[#494c50]' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onToggleResponsiveMode();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Responsive Viewport</span>
                  </span>
                  <span className="font-mono text-[11px] opacity-75">
                    {isResponsiveMode ? 'On' : 'Off'}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onToggleBookmarksBar();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <span>Bookmarks Bar</span>
                  <span className="font-mono text-[11px] opacity-75">
                    {showBookmarksBar ? 'Shown' : 'Hidden'}
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onToggleChromeDark();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  {chromeDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{chromeDark ? 'Chrome Light Appearance' : 'Chrome Dark Appearance'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onToggleMonitorFrame();
                    setMenuOpen(false);
                  }}
                  className="hidden md:flex w-full items-center gap-2.5 px-3.5 py-2 text-left hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{monitorFramed ? 'Hide Monitor Bezel' : 'Show Monitor Bezel'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarksBar && (
        <div
          aria-label="Bookmarks bar"
          className={`flex items-center gap-1 px-2.5 h-7 overflow-x-auto no-scrollbar text-xs border-t ${
            chromeDark ? 'border-[#3c4043]/60' : 'border-slate-100'
          }`}
        >
          {bookmarks.map((bm) => (
            <button
              key={bm.id}
              type="button"
              onClick={() => onNavigateUrl(bm.url)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab.url === bm.url
                  ? chromeDark
                    ? 'bg-white/15 text-white font-medium'
                    : 'bg-blue-50 text-blue-700 font-medium'
                  : chromeDark
                  ? 'hover:bg-white/10 text-slate-300'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Globe className="w-3 h-3 opacity-75 shrink-0" />
              <span>{bm.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
