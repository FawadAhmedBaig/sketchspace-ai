/**
 * DesignControls.jsx
 * 
 * Design Selectors Bar matching the Stitch SketchSpace AI screen design.
 * Provides interactive chips for Room Type and Interior Style selection.
 */

import React from 'react';
import { Home, Sparkles } from 'lucide-react';

const ROOM_TYPES = ['Living Room', 'Bedroom', 'Study', 'Office'];
const INTERIOR_STYLES = ['Modern', 'Minimalist', 'Japandi', 'Cozy', 'Luxury'];

export default function DesignControls({
  roomType = 'Living Room',
  onRoomTypeChange,
  style = 'Modern',
  onStyleChange,
}) {
  return (
    <div
      id="designSelectorsBar"
      className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-charcoal-border/80 flex flex-col gap-3"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Room Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px] shrink-0">
            <Home className="w-3.5 h-3.5 text-teal" />
            Room Type:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {ROOM_TYPES.map((type) => {
              const isActive = roomType.toLowerCase() === type.toLowerCase();
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onRoomTypeChange?.(type)}
                  className={`room-chip px-3 py-1 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'font-semibold bg-teal text-white shadow-xs border border-teal'
                      : 'font-medium bg-cream hover:bg-teal-surface text-charcoal hover:text-teal border border-charcoal-border'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-aqua" />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px lg:h-6 lg:w-px bg-charcoal-border/70" />

        {/* Interior Style Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px] shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-aqua" />
            Interior Style:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {INTERIOR_STYLES.map((s) => {
              const isActive = style.toLowerCase() === s.toLowerCase();
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStyleChange?.(s)}
                  className={`style-chip px-3 py-1 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'font-semibold bg-teal text-white shadow-xs border border-teal'
                      : 'font-medium bg-cream hover:bg-teal-surface text-charcoal hover:text-teal border border-charcoal-border'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-aqua" />}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
