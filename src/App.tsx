/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  createBrowserTab,
  navigateTab,
  stepTabHistory,
  parseOmniboxInput,
  computeResponsiveScale,
  DEVICE_PRESETS,
  type BrowserTab,
  type BookmarkItem,
  type ZoomSetting,
} from './utils/browserEngine';
import { MonitorShell } from './components/MonitorShell';
import { ChromeTabBar } from './components/ChromeTabBar';
import { ChromeToolbar } from './components/ChromeToolbar';
import { ResponsiveDeviceBar } from './components/ResponsiveDeviceBar';
import { BrowserViewport } from './components/BrowserViewport';
import type { HistoryLogEntry } from './components/ChromeInternalPages';

const INITIAL_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm-1', title: 'Google', url: 'chrome://newtab' },
  { id: 'bm-2', title: 'Verge Architecture', url: 'https://verge-studio.design' },
  { id: 'bm-3', title: 'Nordic Craft', url: 'https://nordic-craft.shop' },
  { id: 'bm-4', title: 'Pulse Cloud', url: 'https://pulse-metrics.io' },
  { id: 'bm-5', title: 'Meridian Dispatch', url: 'https://meridian-dispatch.org' },
  {
    id: 'bm-6',
    title: 'Wikipedia: Responsive Web',
    url: 'https://en.wikipedia.org/wiki/Responsive_web_design',
  },
];

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [tabs, setTabs] = useState<BrowserTab[]>(() => [
    createBrowserTab('tab-1', 'chrome://newtab'),
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(INITIAL_BOOKMARKS);
  const [historyEntries, setHistoryEntries] = useState<HistoryLogEntry[]>([]);

  // Chrome & Monitor visual state
  const [chromeDark, setChromeDark] = useState<boolean>(false);
  const [showBookmarksBar, setShowBookmarksBar] = useState<boolean>(true);
  const [monitorFramed, setMonitorFramed] = useState<boolean>(true);
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Responsive Viewport Emulator state
  const [isResponsiveMode, setIsResponsiveMode] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('iphone-15-pro');
  const [viewportWidth, setViewportWidth] = useState<number>(393);
  const [viewportHeight, setViewportHeight] = useState<number>(852);
  const [zoom, setZoom] = useState<ZoomSetting>('auto');
  const [measuredScale, setMeasuredScale] = useState<number>(0.75);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) || tabs[0],
    [tabs, activeTabId]
  );

  const recordHistoryVisit = useCallback((url: string, title: string) => {
    if (url.startsWith('chrome://')) return;
    setHistoryEntries((prev) => {
      if (prev[0]?.url === url) return prev;
      return [
        {
          id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title,
          url,
          visitedAt: formatCurrentTime(),
        },
        ...prev,
      ].slice(0, 100);
    });
  }, []);

  const handleOpenUrl = useCallback(
    (targetUrl: string, inNewTab = false) => {
      if (inNewTab) {
        const nextId = `tab-${Date.now()}`;
        const created = createBrowserTab(nextId, targetUrl);
        setTabs((prev) => [...prev, created]);
        setActiveTabId(nextId);
        recordHistoryVisit(targetUrl, created.title);
        return;
      }

      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTab.id) return tab;
          const updated = navigateTab(tab, targetUrl);
          recordHistoryVisit(targetUrl, updated.title);
          return updated;
        })
      );
    },
    [activeTab.id, recordHistoryVisit]
  );

  const handleOmniboxSubmit = useCallback(
    (rawInput: string) => {
      const parsed = parseOmniboxInput(rawInput);
      if (!parsed) return;
      handleOpenUrl(parsed.url, false);
    },
    [handleOpenUrl]
  );

  const handleNewTab = useCallback(() => {
    const nextId = `tab-${Date.now()}`;
    setTabs((prev) => [...prev, createBrowserTab(nextId, 'chrome://newtab')]);
    setActiveTabId(nextId);
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        if (prev.length === 1) {
          const fresh = createBrowserTab(`tab-${Date.now()}`, 'chrome://newtab');
          setActiveTabId(fresh.id);
          return [fresh];
        }
        const idx = prev.findIndex((t) => t.id === tabId);
        const remaining = prev.filter((t) => t.id !== tabId);
        if (tabId === activeTabId) {
          const fallback = remaining[Math.max(0, idx - 1)] || remaining[0];
          setActiveTabId(fallback.id);
        }
        return remaining;
      });
    },
    [activeTabId]
  );

  const handleStepHistory = useCallback(
    (delta: -1 | 1) => {
      setTabs((prev) =>
        prev.map((tab) => (tab.id === activeTab.id ? stepTabHistory(tab, delta) : tab))
      );
    },
    [activeTab.id]
  );

  const handleReload = useCallback(() => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              isLoading: !tab.url.startsWith('chrome://'),
              reloadNonce: tab.reloadNonce + 1,
            }
          : tab
      )
    );
  }, [activeTab.id]);

  const handlePageLoaded = useCallback(
    (tabId: string, discoveredTitle?: string, discoveredUrl?: string) => {
      setTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== tabId) return tab;
          return {
            ...tab,
            isLoading: false,
            title:
              discoveredTitle && discoveredTitle.trim()
                ? discoveredTitle.trim()
                : tab.title,
            url:
              discoveredUrl &&
              !tab.url.startsWith('chrome://') &&
              !tab.url.includes('google.com/search')
                ? discoveredUrl
                : tab.url,
          };
        })
      );
    },
    []
  );

  const handleToggleCurrentBookmark = useCallback(() => {
    const exists = bookmarks.find((b) => b.url === activeTab.url);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.id !== exists.id));
    } else {
      setBookmarks((prev) => [
        ...prev,
        {
          id: `bm-${Date.now()}`,
          title: activeTab.title.slice(0, 26),
          url: activeTab.url,
        },
      ]);
    }
  }, [activeTab.url, activeTab.title, bookmarks]);

  const handleSelectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    const found = DEVICE_PRESETS.find((d) => d.id === deviceId);
    if (found) {
      setViewportWidth(found.width);
      setViewportHeight(found.height);
    }
  }, []);

  const handleManualDimensions = useCallback((width: number, height: number) => {
    setSelectedDeviceId('responsive');
    setViewportWidth(width);
    setViewportHeight(height);
  }, []);

  const handleRotateViewport = useCallback(() => {
    setViewportWidth(viewportHeight);
    setViewportHeight(viewportWidth);
  }, [viewportWidth, viewportHeight]);

  const handleQuickStudioPreset = useCallback(
    (mode: 'full' | 'mobile' | 'tablet' | 'laptop') => {
      if (mode === 'full') {
        setIsResponsiveMode(false);
        return;
      }
      setIsResponsiveMode(true);
      if (mode === 'mobile') {
        handleSelectDevice('iphone-15-pro');
      } else if (mode === 'tablet') {
        handleSelectDevice('ipad-mini');
      } else if (mode === 'laptop') {
        handleSelectDevice('macbook-air');
      }
    },
    [handleSelectDevice]
  );

  const activePresetBadge = useMemo(() => {
    if (viewportWidth <= 480) return 'mobile';
    if (viewportWidth <= 900) return 'tablet';
    return 'laptop';
  }, [viewportWidth]);

  const previewScale = isResponsiveMode
    ? measuredScale
    : computeResponsiveScale(viewportWidth, viewportHeight, 1200, 680, zoom);

  return (
    <MonitorShell
      monitorFramed={monitorFramed}
      onToggleMonitorFrame={() => setMonitorFramed((v) => !v)}
      isPoweredOn={isPoweredOn}
      onTogglePower={() => setIsPoweredOn((v) => !v)}
      isMinimized={isMinimized}
      onRestoreWindow={() => setIsMinimized(false)}
      isResponsiveMode={isResponsiveMode}
      activeViewportPresetLabel={activePresetBadge}
      onQuickPreset={handleQuickStudioPreset}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <ChromeTabBar
          tabs={tabs}
          activeTabId={activeTab.id}
          chromeDark={chromeDark}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
          onMinimizeWindow={() => setIsMinimized(true)}
          onToggleMaximizeFrame={() => setMonitorFramed((v) => !v)}
        />

        <ChromeToolbar
          activeTab={activeTab}
          chromeDark={chromeDark}
          isResponsiveMode={isResponsiveMode}
          showBookmarksBar={showBookmarksBar}
          bookmarks={bookmarks}
          monitorFramed={monitorFramed}
          onBack={() => handleStepHistory(-1)}
          onForward={() => handleStepHistory(1)}
          onReload={handleReload}
          onHome={() => handleOpenUrl('chrome://newtab', false)}
          onNavigateInput={handleOmniboxSubmit}
          onNavigateUrl={(u) => handleOpenUrl(u, false)}
          onToggleBookmark={handleToggleCurrentBookmark}
          onToggleResponsiveMode={() => setIsResponsiveMode((v) => !v)}
          onToggleChromeDark={() => setChromeDark((v) => !v)}
          onToggleBookmarksBar={() => setShowBookmarksBar((v) => !v)}
          onToggleMonitorFrame={() => setMonitorFramed((v) => !v)}
          onNewTab={handleNewTab}
        />

        {isResponsiveMode && (
          <ResponsiveDeviceBar
            selectedDeviceId={selectedDeviceId}
            viewportWidth={viewportWidth}
            viewportHeight={viewportHeight}
            zoom={zoom}
            computedScale={previewScale}
            onSelectDevice={handleSelectDevice}
            onChangeDimensions={handleManualDimensions}
            onRotate={handleRotateViewport}
            onChangeZoom={setZoom}
            onClose={() => setIsResponsiveMode(false)}
          />
        )}

        <BrowserViewport
          activeTab={activeTab}
          chromeDark={chromeDark}
          isResponsiveMode={isResponsiveMode}
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          zoom={zoom}
          historyEntries={historyEntries}
          bookmarks={bookmarks}
          onChangeDimensions={handleManualDimensions}
          onSubmitOmniboxInput={handleOmniboxSubmit}
          onOpenUrl={handleOpenUrl}
          onPageLoaded={handlePageLoaded}
          onToggleResponsive={() => setIsResponsiveMode((v) => !v)}
          onClearHistory={() => setHistoryEntries([])}
          onAddBookmark={(title, url) =>
            setBookmarks((prev) => [
              ...prev,
              { id: `bm-${Date.now()}`, title, url },
            ])
          }
          onRemoveBookmark={(id) =>
            setBookmarks((prev) => prev.filter((b) => b.id !== id))
          }
          onScaleComputed={setMeasuredScale}
        />
      </div>
    </MonitorShell>
  );
}
