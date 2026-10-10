/**
 * AppHeader.jsx
 * 
 * Top Navigation Bar with modern, polished Lucide icons.
 * Subtle, purposeful accents adhering to modern SaaS design systems.
 */

import React from 'react';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';

export default function AppHeader({
  roomType = 'Living Room',
  style = 'Modern',
  onBackToWorkspace,
  onResetSplit,
  isDemoMode,
  onToggleDemoMode,
  isBackendOnline,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-charcoal-border/70 px-4 sm:px-6 py-3 transition-shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Back Action */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {onBackToWorkspace && (
            <button
              type="button"
              onClick={onBackToWorkspace}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-charcoal-muted hover:text-teal hover:bg-teal-surface/60 transition-colors cursor-pointer"
              title="Back to workspace"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-teal/20 shrink-0">
              <svg className="w-4 h-4 text-aqua" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-sm sm:text-base font-bold tracking-tight text-charcoal">
                SketchSpace<span className="text-teal ml-0.5">AI</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Room Context Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 bg-cream px-2 sm:px-2.5 py-1 rounded-full border border-charcoal-border/80 text-[11px] sm:text-xs font-medium text-charcoal">
            <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0"></span>
            <span className="truncate max-w-[80px] sm:max-w-none">{roomType}</span>
          </div>
          <div className="flex items-center gap-1 bg-aqua-soft px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-teal border border-aqua/30">
            <Sparkles className="w-3 h-3 text-teal shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">{style} Style</span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onResetSplit && (
            <button
              type="button"
              onClick={onResetSplit}
              className="hidden md:flex items-center gap-1 text-xs text-charcoal-muted hover:text-teal font-medium px-2 py-1 rounded transition-colors cursor-pointer"
              title="Reset comparison to 50%"
            >
              <RotateCcw className="w-3 h-3 text-charcoal-light" />
              <span>Reset 50%</span>
            </button>
          )}

          {/* Mode Pill Toggle (Demo / Live API) */}
          {onToggleDemoMode && (
            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : isBackendOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
              title={
                isDemoMode
                  ? 'Demo Mode Active. Click to switch to Live Backend.'
                  : isBackendOnline
                  ? 'Connected to Live FastAPI backend. Click to switch to Demo Mode.'
                  : 'FastAPI Offline. Click to toggle.'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDemoMode ? 'bg-amber-500' : isBackendOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span>{isDemoMode ? 'Demo' : 'Live API'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-charcoal-border">
            <div
              className="w-8 h-8 rounded-full bg-teal-surface border border-teal/20 text-teal flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs select-none"
              title="Logged in as Studio Creator"
            >
              SC
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
