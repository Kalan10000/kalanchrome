import React from 'react';
import { Monitor, Maximize2, Power, Globe } from 'lucide-react';

interface MonitorShellProps {
  monitorFramed: boolean;
  onToggleMonitorFrame: () => void;
  isPoweredOn: boolean;
  onTogglePower: () => void;
  isMinimized: boolean;
  onRestoreWindow: () => void;
  isResponsiveMode: boolean;
  activeViewportPresetLabel: string;
  onQuickPreset: (mode: 'full' | 'mobile' | 'tablet' | 'laptop') => void;
  children: React.ReactNode;
}

export function MonitorShell({
  monitorFramed,
  onToggleMonitorFrame,
  isPoweredOn,
  onTogglePower,
  isMinimized,
  onRestoreWindow,
  isResponsiveMode,
  activeViewportPresetLabel,
  onQuickPreset,
  children,
}: MonitorShellProps) {
  return (
    <div className="h-dvh w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* Studio Workspace Header — follows strict 3-zone Top Bar Contract on desktop */}
      <header className="hidden md:flex items-center justify-between gap-8 px-5 h-11 border-b border-slate-800/80 bg-slate-950/95 shrink-0 z-20">
        <div className="text-sm font-semibold tracking-tight text-slate-100 whitespace-nowrap shrink-0">
          Studio Display 27&quot;
        </div>

        <nav
          aria-label="Quick viewport presets"
          className="flex items-center gap-6 text-xs font-medium text-slate-400"
        >
          <button
            type="button"
            onClick={() => onQuickPreset('full')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              !isResponsiveMode ? 'text-white underline underline-offset-4' : ''
            }`}
          >
            Full Canvas
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset('mobile')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isResponsiveMode && activeViewportPresetLabel === 'mobile'
                ? 'text-white underline underline-offset-4'
                : ''
            }`}
          >
            Mobile 393px
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset('tablet')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isResponsiveMode && activeViewportPresetLabel === 'tablet'
                ? 'text-white underline underline-offset-4'
                : ''
            }`}
          >
            Tablet 768px
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset('laptop')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isResponsiveMode && activeViewportPresetLabel === 'laptop'
                ? 'text-white underline underline-offset-4'
                : ''
            }`}
          >
            Laptop 1280px
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleMonitorFrame}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {monitorFramed ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Frameless View</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Monitor Bezel</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Stage */}
      <div
        className={`flex-1 min-h-0 flex flex-col items-center justify-center relative ${
          monitorFramed ? 'p-0 md:px-6 md:pt-4 md:pb-2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black' : 'p-0'
        }`}
      >
        {/* Physical Monitor Chassis */}
        <div
          className={`w-full flex-1 min-h-0 flex flex-col transition-transform duration-200 ${
            monitorFramed
              ? 'max-w-[1380px] md:rounded-[20px] md:p-2.5 md:pb-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 md:border md:border-zinc-700/75 md:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85)]'
              : 'max-w-none'
          }`}
        >
          {/* Top Optical Camera Bezel Strip (visible in framed mode on desktop) */}
          {monitorFramed && (
            <div className="hidden md:flex items-center justify-center h-3.5 shrink-0 relative">
              <div
                aria-hidden="true"
                className="w-2 h-2 rounded-full bg-zinc-950 ring-1 ring-zinc-700 flex items-center justify-center"
              >
                <div className="w-0.5 h-0.5 rounded-full bg-sky-900/80" />
              </div>
            </div>
          )}

          {/* Inner LCD Glass Viewport */}
          <div
            className={`flex-1 min-h-0 w-full relative overflow-hidden flex flex-col ${
              monitorFramed ? 'md:rounded-t-[10px] md:ring-1 md:ring-black/90' : ''
            } bg-zinc-950 select-text`}
          >
            {!isPoweredOn ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 p-6 text-center">
                <Power className="w-8 h-8 mb-3 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">
                  Studio Display in Standby
                </p>
                <p className="text-xs text-zinc-500 mt-1 mb-5">
                  Press the monitor power switch below to wake display
                </p>
                <button
                  type="button"
                  onClick={onTogglePower}
                  className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700 transition-colors cursor-pointer"
                >
                  Wake Display
                </button>
              </div>
            ) : isMinimized ? (
              /* Monitor OS Desktop when Chrome is minimized */
              <div className="flex-1 flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 text-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Studio OS</span>
                  <span className="font-mono tabular-nums">2560 × 1440 HiDPI</span>
                </div>
                <div className="my-auto text-center max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                    Google Chrome is minimized
                  </h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Your open tabs and responsive viewport settings are preserved in the session dock.
                  </p>
                  <button
                    type="button"
                    onClick={onRestoreWindow}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Restore Google Chrome</span>
                  </button>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <button
                      type="button"
                      onClick={onRestoreWindow}
                      aria-label="Open Google Chrome from dock"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-blue-500 via-emerald-400 to-amber-400 inline-block" />
                      <span>Google Chrome</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Anodized Aluminum Monitor Chin */}
          {monitorFramed && (
            <div className="hidden md:flex items-center justify-between px-4 h-7 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-b-[16px] border-t border-zinc-700/50 shrink-0 select-none">
              <div className="w-28 text-[11px] font-mono tabular-nums text-zinc-500 whitespace-nowrap">
                60Hz · sRGB
              </div>
              <div className="text-[11px] font-semibold tracking-widest text-zinc-400 whitespace-nowrap">
                STUDIO
              </div>
              <div className="w-28 flex justify-end">
                <button
                  type="button"
                  onClick={onTogglePower}
                  aria-label={isPoweredOn ? 'Put monitor in standby' : 'Turn monitor on'}
                  title={isPoweredOn ? 'Standby Power' : 'Wake Display'}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isPoweredOn
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-700/60'
                      : 'text-amber-400 bg-zinc-800'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{isPoweredOn ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Machined Aluminum Stand Neck & Base (Desktop Framed Only) */}
        {monitorFramed && (
          <div
            aria-hidden="true"
            className="hidden lg:flex flex-col items-center shrink-0 pointer-events-none"
          >
            <div className="w-24 h-4 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 border-x border-zinc-700/80 shadow-inner" />
            <div className="w-52 h-2 rounded-full bg-gradient-to-r from-zinc-800 via-zinc-500 to-zinc-800 shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-t border-zinc-400/30" />
          </div>
        )}
      </div>
    </div>
  );
}
