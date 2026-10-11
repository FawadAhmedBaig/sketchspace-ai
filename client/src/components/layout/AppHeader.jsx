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
}) {
  const displayRoomType = (roomType && String(roomType).trim()) || 'Living Room';
  const displayStyle = (style && String(style).trim()) || 'Modern';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-charcoal-border/70 px-4 sm:px-6 py-3 transition-shadow">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Back Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal text-white shrink-0 shadow-sm">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <span className="text-base sm:text-xl font-bold leading-tight text-charcoal block">
                SketchSpace AI
              </span>
              <p className="text-xs sm:text-sm text-stone-500">
                Sketch a room. Let AI design it.
              </p>
            </div>
          </div>
        </div>

        {/* Center Room Context Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 bg-cream px-2 sm:px-2.5 py-1 rounded-full border border-charcoal-border/80 text-[11px] sm:text-xs font-medium text-charcoal">
            <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0"></span>
            <span className="truncate max-w-[80px] sm:max-w-none">{displayRoomType}</span>
          </div>
          <div className="flex items-center gap-1 bg-aqua-soft px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-teal border border-aqua/30">
            <Sparkles className="w-3 h-3 text-teal shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">{displayStyle} Style</span>
          </div>
        </div>

        {/* Actions */}
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
        </div>
      </div>
    </header>
  );
}
