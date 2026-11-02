import React, { useEffect, useRef, useState } from 'react';
import {
  extractGoogleSearchQuery,
  clampViewportDimension,
  computeResponsiveScale,
  type BrowserTab,
  type BookmarkItem,
  type ZoomSetting,
} from '../utils/browserEngine';
import { findShowcaseSiteByUrl } from '../data/showcaseSites';
import { NewTabPage } from './NewTabPage';
import { GoogleSearchResults } from './GoogleSearchResults';
import { ChromeInternalPages, type HistoryLogEntry } from './ChromeInternalPages';

interface BrowserViewportProps {
  activeTab: BrowserTab;
  chromeDark: boolean;
  isResponsiveMode: boolean;
  viewportWidth: number;
  viewportHeight: number;
  zoom: ZoomSetting;
  historyEntries: HistoryLogEntry[];
  bookmarks: BookmarkItem[];
  onChangeDimensions: (width: number, height: number) => void;
  onSubmitOmniboxInput: (rawInput: string) => void;
  onOpenUrl: (url: string, inNewTab?: boolean) => void;
  onPageLoaded: (tabId: string, discoveredTitle?: string, discoveredUrl?: string) => void;
  onToggleResponsive: () => void;
  onClearHistory: () => void;
  onAddBookmark: (title: string, url: string) => void;
  onRemoveBookmark: (id: string) => void;
  onScaleComputed?: (scale: number) => void;
}

export function BrowserViewport({
  activeTab,
  chromeDark,
  isResponsiveMode,
  viewportWidth,
  viewportHeight,
  zoom,
  historyEntries,
  bookmarks,
  onChangeDimensions,
  onSubmitOmniboxInput,
  onOpenUrl,
  onPageLoaded,
  onToggleResponsive,
  onClearHistory,
  onAddBookmark,
  onRemoveBookmark,
  onScaleComputed,
}: BrowserViewportProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1200, height: 740 });
  const [isDraggingResize, setIsDraggingResize] = useState<
    null | 'right' | 'bottom' | 'corner'
  >(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Listen for navigation & load messages posted from proxied or showcase iframes
  useEffect(() => {
    function onWindowMessage(event: MessageEvent) {
      const payload = event.data;
      if (!payload || typeof payload !== 'object') return;
      if (payload.type === 'CHROME_NAVIGATE' && typeof payload.url === 'string') {
        onOpenUrl(payload.url, Boolean(payload.newTab));
      } else if (payload.type === 'CHROME_PAGE_LOADED') {
        onPageLoaded(
          activeTab.id,
          typeof payload.title === 'string' ? payload.title : undefined,
          typeof payload.url === 'string' ? payload.url : undefined
        );
      }
    }
    window.addEventListener('message', onWindowMessage);
    return () => window.removeEventListener('message', onWindowMessage);
  }, [activeTab.id, onOpenUrl, onPageLoaded]);

  const computedScale = isResponsiveMode
    ? computeResponsiveScale(
        viewportWidth,
        viewportHeight,
        stageSize.width,
        stageSize.height,
        zoom
      )
    : 1;

  useEffect(() => {
    if (isResponsiveMode && onScaleComputed) {
      onScaleComputed(computedScale);
    }
  }, [isResponsiveMode, computedScale, onScaleComputed]);

  // Interactive drag-to-resize handler for Responsive Viewport Mode
  const startResizeDrag = (
    edge: 'right' | 'bottom' | 'corner',
    e: React.PointerEvent
  ) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialW = viewportWidth;
    const initialH = viewportHeight;
    const activeScale = computedScale || 1;

    setIsDraggingResize(edge);

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / activeScale;
      const deltaY = (moveEvent.clientY - startY) / activeScale;
      // Since centered horizontally, dragging right edge symmetrically adjusts width by 2x deltaX
      const nextW =
        edge === 'right' || edge === 'corner'
          ? clampViewportDimension(initialW + deltaX * 2, 280, 2560)
          : initialW;
      const nextH =
        edge === 'bottom' || edge === 'corner'
          ? clampViewportDimension(initialH + deltaY, 320, 2160)
          : initialH;
      onChangeDimensions(nextW, nextH);
    };

    const handleUp = () => {
      setIsDraggingResize(null);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const googleQuery = extractGoogleSearchQuery(activeTab.url);
  const showcaseSite = findShowcaseSiteByUrl(activeTab.url);

  const renderSurfaceContent = () => {
    if (activeTab.url === 'chrome://newtab') {
      return (
        <NewTabPage
          chromeDark={chromeDark}
          isResponsiveMode={isResponsiveMode}
          onSubmitInput={onSubmitOmniboxInput}
          onNavigateUrl={(u) => onOpenUrl(u, false)}
          onToggleResponsive={onToggleResponsive}
        />
      );
    }

    if (
      activeTab.url === 'chrome://history' ||
      activeTab.url === 'chrome://bookmarks'
    ) {
      return (
        <ChromeInternalPages
          route={activeTab.url}
          chromeDark={chromeDark}
          historyEntries={historyEntries}
          bookmarks={bookmarks}
          onOpenUrl={(u) => onOpenUrl(u, false)}
          onClearHistory={onClearHistory}
          onAddBookmark={onAddBookmark}
          onRemoveBookmark={onRemoveBookmark}
        />
      );
    }

    if (googleQuery !== null) {
      return (
        <GoogleSearchResults
          query={googleQuery}
          chromeDark={chromeDark}
          reloadNonce={activeTab.reloadNonce}
          onSearchQuery={(q) =>
            onOpenUrl(`https://www.google.com/search?q=${encodeURIComponent(q)}`, false)
          }
          onOpenWebsite={onOpenUrl}
          onLoadComplete={() => onPageLoaded(activeTab.id)}
        />
      );
    }

    if (showcaseSite) {
      return (
        <iframe
          key={`${showcaseSite.url}-${activeTab.reloadNonce}`}
          title={showcaseSite.title}
          srcDoc={showcaseSite.getHtml()}
          onLoad={() => onPageLoaded(activeTab.id, showcaseSite.title)}
          className={`w-full h-full border-0 bg-white ${
            isDraggingResize ? 'pointer-events-none' : ''
          }`}
        />
      );
    }

    const proxySrc = `/api/proxy?url=${encodeURIComponent(activeTab.url)}&_r=${
      activeTab.reloadNonce
    }`;
    return (
      <iframe
        key={`${activeTab.url}-${activeTab.reloadNonce}`}
        title={activeTab.title}
        src={proxySrc}
        onLoad={() => onPageLoaded(activeTab.id)}
        className={`w-full h-full border-0 bg-white ${
          isDraggingResize ? 'pointer-events-none' : ''
        }`}
      />
    );
  };

  return (
    <div
      ref={stageRef}
      data-testid="browser-viewport-stage"
      className={`flex-1 min-h-0 w-full relative overflow-auto flex ${
        isResponsiveMode
          ? 'items-start justify-center p-5 bg-[#17181c] bg-[radial-gradient(#2d3139_1px,transparent_1px)] [background-size:16px_16px]'
          : 'items-stretch justify-stretch bg-white'
      }`}
    >
      {/* Top Progress Line when Loading */}
      {activeTab.isLoading && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-30 animate-pulse"
        />
      )}

      {!isResponsiveMode ? (
        <div className="w-full h-full min-h-0 flex-1">{renderSurfaceContent()}</div>
      ) : (
        /* Scaled Responsive Device Frame Wrapper */
        <div
          style={{
            width: `${Math.round(viewportWidth * computedScale)}px`,
            height: `${Math.round(viewportHeight * computedScale)}px`,
          }}
          className="relative shrink-0 my-auto mr-5 mb-5"
        >
          <div
            data-testid="responsive-emulated-frame"
            style={{
              width: `${viewportWidth}px`,
              height: `${viewportHeight}px`,
              transform: `scale(${computedScale})`,
              transformOrigin: 'top left',
            }}
            className="absolute top-0 left-0 shrink-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.65)] ring-1 ring-slate-700 rounded-xs overflow-hidden"
          >
            {renderSurfaceContent()}
          </div>

          {/* Right Drag Handle */}
          <button
            type="button"
            aria-label="Drag right edge to resize viewport width"
            onPointerDown={(e) => startResizeDrag('right', e)}
            className="absolute top-0 -right-4 w-4 h-full flex items-center justify-center cursor-ew-resize group focus:outline-none"
          >
            <span className="w-1 h-12 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors" />
          </button>

          {/* Bottom Drag Handle */}
          <button
            type="button"
            aria-label="Drag bottom edge to resize viewport height"
            onPointerDown={(e) => startResizeDrag('bottom', e)}
            className="absolute left-0 -bottom-4 h-4 w-full flex items-center justify-center cursor-ns-resize group focus:outline-none"
          >
            <span className="h-1 w-12 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors" />
          </button>

          {/* Corner Drag Handle */}
          <button
            type="button"
            aria-label="Drag corner to resize viewport width and height"
            onPointerDown={(e) => startResizeDrag('corner', e)}
            className="absolute -right-4 -bottom-4 w-4 h-4 flex items-center justify-center cursor-nwse-resize text-slate-500 hover:text-blue-400 focus:outline-none"
          >
            <span className="w-2.5 h-2.5 border-r-2 border-b-2 border-current" />
          </button>
        </div>
      )}
    </div>
  );
}
