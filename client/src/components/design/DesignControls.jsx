/**
 * DesignControls.jsx
 * 
 * Clean Design Selectors Bar — display only.
 * Room type and style chips are shown as visual indicators
 * of the current configuration, not interactive selectors.
 */

import React from 'react';
import { Home, Palette } from 'lucide-react';

export default function DesignControls({
  roomType = 'Living Room',
  style = 'Modern',
}) {
  const displayRoomType = (roomType && String(roomType).trim()) || 'Living Room';
  const displayStyle = (style && String(style).trim()) || 'Modern';

  return (
    <div
      id="designSelectorsBar"
      className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-charcoal-border/80 flex flex-col gap-3"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Room Type Display */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px] shrink-0">
            <Home className="w-3.5 h-3.5 text-teal" />
            Room Type:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="room-chip px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal text-white shadow-xs border border-brand-teal">
              {displayRoomType}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px lg:h-6 lg:w-px bg-charcoal-border/70" />

        {/* Interior Style Display */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px] shrink-0">
            <Palette className="w-3.5 h-3.5 text-teal" />
            Interior Style:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="style-chip px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal text-white shadow-xs border border-brand-teal">
              {displayStyle}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
