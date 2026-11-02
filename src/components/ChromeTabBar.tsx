import React from 'react';
import { Plus, X, Globe, Search, Clock, Bookmark, Loader2 } from 'lucide-react';
import type { BrowserTab } from '../utils/browserEngine';

interface ChromeTabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  chromeDark: boolean;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  onMinimizeWindow: () => void;
  onToggleMaximizeFrame: () => void;
}

function TabFavicon({ url, isLoading }: { url: string; isLoading: boolean }) {
  if (isLoading) {
    return <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />;
  }
  if (url === 'chrome://newtab' || url.includes('google.com/search')) {
    return (
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0"
      >
        G
      </span>
    );
  }
  if (url === 'chrome://history') {
    return <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  }
  if (url === 'chrome://bookmarks') {
    return <Bookmark className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  }
  if (url.includes('wikipedia.org')) {
    return (
      <span
        aria-hidden="true"
        className="w-4 h-4 rounded bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-serif font-bold text-slate-900 shrink-0"
      >
        W
      </span>
    );
  }
  if (url.includes('google.com')) {
    return <Search className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  }
  return <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
}

export function ChromeTabBar({
  tabs,
  activeTabId,
  chromeDark,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onMinimizeWindow,
  onToggleMaximizeFrame,
}: ChromeTabBarProps) {
  return (
    <div
      className={`flex items-end gap-1 px-2 pt-2 h-10 select-none shrink-0 border-b ${
        chromeDark
          ? 'bg-[#202124] border-[#3c4043] text-slate-200'
          : 'bg-[#dee1e6] border-[#c8ccd1] text-slate-800'
      }`}
    >
      {/* Window Controls */}
      <div className="hidden sm:flex items-center gap-2 px-2 pb-2.5 shrink-0">
        <button
          type="button"
          onClick={onMinimizeWindow}
          aria-label="Minimize Chrome window to monitor desktop"
          title="Minimize to Monitor Desktop"
          className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-95 border border-black/15 cursor-pointer"
        />
        <button
          type="button"
          onClick={onToggleMaximizeFrame}
          aria-label="Toggle full screen or framed monitor view"
          title="Toggle Monitor Bezel"
          className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-95 border border-black/15 cursor-pointer"
        />
      </div>

      {/* Tabs Strip */}
      <div
        role="tablist"
        aria-label="Browser tabs"
        className="flex items-end gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`group flex items-center gap-2 min-w-[120px] max-w-[220px] flex-1 h-8 px-3 rounded-t-lg text-xs transition-colors relative ${
                isActive
                  ? chromeDark
                    ? 'bg-[#323639] text-slate-100 shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : chromeDark
                  ? 'bg-transparent hover:bg-[#292b2e] text-slate-400'
                  : 'bg-transparent hover:bg-[#ebedf0] text-slate-600'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className="flex items-center gap-2 flex-1 min-w-0 h-full text-left cursor-pointer focus:outline-none"
              >
                <TabFavicon url={tab.url} isLoading={tab.isLoading} />
                <span className="truncate font-medium">{tab.title}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                aria-label={`Close tab ${tab.title}`}
                className={`p-0.5 rounded-full transition-colors shrink-0 cursor-pointer ${
                  chromeDark
                    ? 'hover:bg-slate-600/70 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onNewTab}
          aria-label="Open new tab"
          title="New Tab"
          className={`mb-1 p-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${
            chromeDark
              ? 'hover:bg-[#323639] text-slate-300'
              : 'hover:bg-black/10 text-slate-700'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
