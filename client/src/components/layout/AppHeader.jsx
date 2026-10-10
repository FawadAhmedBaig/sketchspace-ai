/**
 * AppHeader.jsx
 * 
 * Top application header for SketchSpace AI.
 * Displays brand identity, room context, mode toggle (Live API vs Demo),
 * "Back to Workspace" navigation, and the mandatory "Download Design" action.
 * 
 * Flutter Developer Note:
 * In Flutter, this is analogous to an AppBar widget with:
 * - leading: IconButton(icon: Icon(Icons.arrow_back), onPressed: onBackToWorkspace)
 * - title: Row(children: [Text('SketchSpace AI'), Chip(...)])
 * - actions: [DownloadButton, ModeSwitch]
 */

import React from 'react';
import {
  ArrowLeft,
  Download,
  Loader2,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';

export default function AppHeader({
  roomType = 'Living Room',
  style = 'Modern',
  onBackToWorkspace,
  onDownloadDesign,
  isDownloading = false,
  hasGeneratedDesign = false,
  isDemoMode = false,
  onToggleDemoMode,
  isBackendOnline = false,
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Navigation and Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          {onBackToWorkspace && (
            <button
              type="button"
              onClick={onBackToWorkspace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#1F2937] hover:text-[#0F6B63] hover:bg-[#FAF9F6] border border-[#E5E7EB] transition-all cursor-pointer"
              title="Return to canvas workspace"
            >
              <ArrowLeft className="w-4 h-4 text-[#0F6B63]" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F6B63] flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#4FD1C5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-[#1F2937]">
                  SketchSpace<span className="text-[#0F6B63]">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#4FD1C5]/20 text-[#0F6B63]">
                  Design & Refine
                </span>
              </div>
              <p className="text-[11px] text-[#4B5563] hidden sm:block">
                AI Interior Architecture & Layout Studio
              </p>
            </div>
          </div>
        </div>

        {/* Center: Current Design Context */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[#E5E7EB] text-xs">
          <span className="font-semibold text-[#1F2937]">{roomType}</span>
          <span className="text-gray-300">•</span>
          <span className="text-[#0F6B63] font-medium">{style} Style</span>
          <span className="text-gray-300">•</span>
          <span className="text-emerald-700 text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#4FD1C5]" />
            Layout Preserved
          </span>
        </div>

        {/* Right: Actions, API Mode Toggle, and Download */}
        <div className="flex items-center gap-2.5">
          {/* Live vs Demo Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer
              ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : isBackendOnline
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }
            `}
            title={
              isDemoMode
                ? 'Running in Demo Mode with instant mock renders. Click to switch to Live FastAPI backend.'
                : isBackendOnline
                ? 'Connected to Live FastAPI backend (http://localhost:8000). Click to switch to Demo Mode.'
                : 'FastAPI backend is offline. Click to switch to Demo Mode.'
            }
          >
            {isDemoMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Demo Mode</span>
              </>
            ) : isBackendOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Live API</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">API Offline</span>
              </>
            )}
          </button>

          {/* Mandatory "Download Design" Action */}
          <button
            type="button"
            onClick={onDownloadDesign}
            disabled={!hasGeneratedDesign || isDownloading}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
              text-white bg-[#0F6B63] hover:bg-[#0b544e] active:bg-[#094540]
              shadow-2xs transition-all duration-150 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]
              ${
                !hasGeneratedDesign || isDownloading
                  ? 'opacity-50 cursor-not-allowed hover:bg-[#0F6B63]'
                  : 'hover:shadow active:scale-98'
              }
            `}
            title={
              hasGeneratedDesign
                ? 'Download the current photorealistic AI design as a PNG'
                : 'Generate a design first to download'
            }
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Exporting PNG...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#4FD1C5]" />
                <span>Download Design</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
