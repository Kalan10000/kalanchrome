import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import {
  DEVICE_PRESETS,
  BREAKPOINT_STOPS,
  clampViewportDimension,
  getCssBreakpointBadge,
  type ZoomSetting,
} from '../utils/browserEngine';

interface ResponsiveDeviceBarProps {
  selectedDeviceId: string;
  viewportWidth: number;
  viewportHeight: number;
  zoom: ZoomSetting;
  computedScale: number;
  onSelectDevice: (deviceId: string) => void;
  onChangeDimensions: (width: number, height: number) => void;
  onRotate: () => void;
  onChangeZoom: (zoom: ZoomSetting) => void;
  onClose: () => void;
}

export function ResponsiveDeviceBar({
  selectedDeviceId,
  viewportWidth,
  viewportHeight,
  zoom,
  computedScale,
  onSelectDevice,
  onChangeDimensions,
  onRotate,
  onChangeZoom,
  onClose,
}: ResponsiveDeviceBarProps) {
  const bp = getCssBreakpointBadge(viewportWidth);

  return (
    <div className="bg-[#202124] border-b border-[#3c4043] text-slate-200 select-none shrink-0">
      {/* Primary DevTools Device Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Device preset</span>
            <select
              aria-label="Device preset"
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="bg-[#303134] hover:bg-[#3c4043] text-slate-100 border border-[#5f6368] rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {DEVICE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>

          {/* Width × Height Inputs */}
          <div className="flex items-center gap-1 font-mono tabular-nums">
            <input
              type="number"
              min={280}
              max={2560}
              value={viewportWidth}
              aria-label="Viewport width in pixels"
              onChange={(e) =>
                onChangeDimensions(
                  clampViewportDimension(Number(e.target.value), 280, 2560),
                  viewportHeight
                )
              }
              className="w-16 bg-[#303134] text-slate-100 border border-[#5f6368] rounded px-1.5 py-1 text-center text-xs focus:outline-none focus:border-blue-400"
            />
            <span className="text-slate-400">×</span>
            <input
              type="number"
              min={320}
              max={2160}
              value={viewportHeight}
              aria-label="Viewport height in pixels"
              onChange={(e) =>
                onChangeDimensions(
                  viewportWidth,
                  clampViewportDimension(Number(e.target.value), 320, 2160)
                )
              }
              className="w-16 bg-[#303134] text-slate-100 border border-[#5f6368] rounded px-1.5 py-1 text-center text-xs focus:outline-none focus:border-blue-400"
            />
            <span className="text-slate-400 text-[11px] ml-0.5">px</span>
          </div>

          <button
            type="button"
            onClick={onRotate}
            aria-label="Rotate viewport orientation"
            title="Rotate Orientation (Swap W × H)"
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#303134] hover:bg-[#3c4043] border border-[#5f6368] text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotate</span>
          </button>

          {/* Zoom Selector */}
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Viewport zoom</span>
            <select
              aria-label="Viewport zoom"
              value={String(zoom)}
              onChange={(e) => {
                const val = e.target.value;
                onChangeZoom(val === 'auto' ? 'auto' : (Number(val) as ZoomSetting));
              }}
              className="bg-[#303134] hover:bg-[#3c4043] text-slate-100 border border-[#5f6368] rounded px-2 py-1 text-xs font-mono tabular-nums focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="auto">
                Auto-fit ({Math.round(computedScale * 100)}%)
              </option>
              <option value="100">100%</option>
              <option value="75">75%</option>
              <option value="50">50%</option>
            </select>
          </label>
        </div>

        {/* Clean Unboxed CSS Breakpoint Metadata + Close */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
            <span className="text-blue-400 font-medium">{bp.code}</span>
            <span aria-hidden="true">·</span>
            <span>{bp.description}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Exit responsive viewport mode"
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Interactive Media-Query Breakpoint Snap Bar */}
      <div className="flex items-center justify-center gap-1 px-3 py-1 bg-[#17181b] border-t border-[#2c2e33] overflow-x-auto no-scrollbar">
        {BREAKPOINT_STOPS.map((stop) => {
          const isCurrent = viewportWidth === stop.width;
          return (
            <button
              key={stop.width}
              type="button"
              onClick={() => onChangeDimensions(stop.width, viewportHeight)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              {stop.label} · {stop.width}px
            </button>
          );
        })}
      </div>
    </div>
  );
}
