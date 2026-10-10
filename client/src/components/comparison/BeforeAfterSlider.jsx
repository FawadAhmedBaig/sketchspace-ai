/**
 * BeforeAfterSlider.jsx
 * 
 * Interactive Before/After Image Comparison Slider.
 * Overlays the AI-generated interior design on top of the original user sketch/photo,
 * with a draggable vertical divider, circular handle, touch/mouse/keyboard controls,
 * and aspect-ratio preservation.
 * 
 * Flutter Developer Note:
 * In Flutter, you would build this with a Stack widget:
 * - Positioned.fill(child: Image(...)) for the base
 * - ClipRect with a CustomClipper or Align(alignment: Alignment.centerRight) for overlay
 * - GestureDetector(onHorizontalDragUpdate: (details) => setState(...))
 * In React, we use standard DOM elements with CSS `clip-path: inset(0 0 0 X%)`
 * and pointer event listeners with `useState` and `useRef`.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  ChevronsLeftRight,
  RotateCcw,
  Sparkles,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';
import { normalizeImageDataUrl } from '../../utils/imageUtils';

export default function BeforeAfterSlider({
  originalImage,
  generatedImage,
  sliderPosition = 50,
  onSliderChange,
  className = '',
  roomLabel = '',
}) {
  const [internalPosition, setInternalPosition] = useState(sliderPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Controlled or uncontrolled position support
  const currentPosition = onSliderChange ? sliderPosition : internalPosition;

  const updatePosition = useCallback(
    (newPos) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newPos * 10) / 10));
      if (onSliderChange) {
        onSliderChange(clamped);
      } else {
        setInternalPosition(clamped);
      }
    },
    [onSliderChange]
  );

  // Calculate percentage from pointer event relative to container
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0) return;
      const clientX = e.clientX;
      const offset = clientX - rect.left;
      const percent = (offset / rect.width) * 100;
      updatePosition(percent);
    },
    [isDragging, updatePosition]
  );

  const handlePointerDown = (e) => {
    setIsDragging(true);
    if (e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for browsers that don't support pointer capture on specific target
      }
    }
    // Also jump immediately to click position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      updatePosition(percent);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Ignore
      }
    }
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updatePosition(currentPosition - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updatePosition(currentPosition + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      updatePosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      updatePosition(100);
    } else if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
      e.preventDefault();
      updatePosition(50);
    }
  };

  const originalSrc = normalizeImageDataUrl(originalImage);
  const generatedSrc = normalizeImageDataUrl(generatedImage);

  // If both images are missing
  if (!originalSrc && !generatedSrc) {
    return (
      <div className="w-full aspect-16/10 min-h-[360px] max-h-[580px] rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#E5E7EB] flex items-center justify-center mb-3 text-[#0F6B63]">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-[#1F2937]">No Design Loaded</h3>
        <p className="text-xs text-[#4B5563] mt-1 max-w-sm">
          Please upload a room layout sketch or generate a design to preview comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      {/* Main Comparison Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-16/10 min-h-[380px] max-h-[620px] rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] bg-[#FAF9F6] select-none touch-none cursor-ew-resize group"
      >
        {/* BASE LAYER: Original user sketch/photo */}
        {originalSrc ? (
          <img
            src={originalSrc}
            alt="Original layout sketch"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
            loading="eager"
            draggable="false"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
            Original image missing
          </div>
        )}

        {/* OVERLAY LAYER: AI-Generated interior design clipped to right side */}
        {generatedSrc ? (
          <div
            style={{
              clipPath: `inset(0 0 0 ${currentPosition}%)`,
              WebkitClipPath: `inset(0 0 0 ${currentPosition}%)`,
            }}
            className="absolute inset-0 w-full h-full pointer-events-none select-none transition-none"
          >
            <img
              src={generatedSrc}
              alt="AI-generated photorealistic interior"
              className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
              loading="eager"
              draggable="false"
            />
          </div>
        ) : (
          <div
            style={{
              clipPath: `inset(0 0 0 ${currentPosition}%)`,
              WebkitClipPath: `inset(0 0 0 ${currentPosition}%)`,
            }}
            className="absolute inset-0 bg-[#0F6B63]/10 backdrop-blur-xs flex items-center justify-center text-xs text-[#0F6B63] font-medium"
          >
            AI Render Pending...
          </div>
        )}

        {/* LABELS: Original vs AI Generated */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E5E7EB]/80 text-[#1F2937] text-xs font-semibold shadow-2xs">
            <Pencil className="w-3 h-3 text-[#0F6B63]" />
            <span>Original Sketch</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F6B63]/90 backdrop-blur-md border border-[#4FD1C5]/30 text-white text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#4FD1C5]" />
            <span>AI Generated</span>
          </div>
        </div>

        {/* DIVIDER VERTICAL LINE */}
        <div
          style={{ left: `${currentPosition}%` }}
          className="absolute top-0 bottom-0 w-0.75 -ml-px bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)] z-20 pointer-events-none"
        />

        {/* DRAGGABLE CIRCULAR HANDLE */}
        <div
          role="slider"
          aria-label="Before and after comparison slider"
          aria-valuenow={Math.round(currentPosition)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          style={{ left: `${currentPosition}%`, top: '50%' }}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          className={`
            absolute -translate-x-1/2 -translate-y-1/2 z-30
            w-10 h-10 rounded-full
            bg-[#0F6B63] text-white
            border-2 border-white
            shadow-md flex items-center justify-center
            cursor-ew-resize select-none
            transition-transform duration-100
            ${isDragging ? 'scale-110 ring-4 ring-[#4FD1C5]/60 bg-[#0b544e]' : 'hover:scale-105 hover:bg-[#0b544e]'}
            focus:outline-none focus:ring-4 focus:ring-[#4FD1C5]
          `}
        >
          <ChevronsLeftRight className="w-5 h-5 text-white stroke-[2.2]" />
        </div>

        {/* Quick Click-to-slide overlay */}
        <div
          onPointerDown={handlePointerDown}
          className="absolute inset-0 z-10 opacity-0 cursor-ew-resize"
          title="Drag or click to compare"
        />
      </div>

      {/* FOOTER CONTROLS & PRESET BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1 text-xs">
        <div className="flex items-center gap-2 text-[#4B5563]">
          <span className="font-medium text-[#1F2937]">Comparison View:</span>
          <span className="tabular-nums font-mono text-[#0F6B63] font-semibold">
            {Math.round(currentPosition)}%
          </span>
          {roomLabel && (
            <span className="text-gray-400 hidden sm:inline">• {roomLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updatePosition(100)}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentPosition === 100
                ? 'bg-[#0F6B63] text-white border-[#0F6B63] font-medium'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            Original
          </button>

          <button
            type="button"
            onClick={() => updatePosition(50)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentPosition === 50
                ? 'bg-[#0F6B63] text-white border-[#0F6B63] font-medium'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-gray-50'
            }`}
            title="Reset slider to 50/50 split"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Split (50%)</span>
          </button>

          <button
            type="button"
            onClick={() => updatePosition(0)}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              currentPosition === 0
                ? 'bg-[#0F6B63] text-white border-[#0F6B63] font-medium'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            AI Render
          </button>
        </div>
      </div>
    </div>
  );
}
