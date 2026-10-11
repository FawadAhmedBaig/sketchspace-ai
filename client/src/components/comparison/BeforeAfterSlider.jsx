/**
 * BeforeAfterSlider.jsx
 * 
 * Interactive Before/After Comparison section.
 * Modern, tasteful Lucide icons for camera/AI labels, split view, and export actions.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Columns2,
  Download,
  Bookmark,
  RotateCcw,
} from 'lucide-react';
import { normalizeImageDataUrl } from '../../utils/imageUtils';

export default function BeforeAfterSlider({
  originalImage,
  generatedImage,
  sliderPosition = 50,
  onSliderChange,
  onDownload,
  onSave,
  isDownloading = false,
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Sync frame width for original clipped image sizing
  useEffect(() => {
    function measureWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  const originalSrc = normalizeImageDataUrl(originalImage) || '/stitch/original-room.jpg';
  const generatedSrc = normalizeImageDataUrl(generatedImage) || '/stitch/ai-generated-room.jpg';

  const handleRangeChange = (e) => {
    onSliderChange?.(Number(e.target.value));
  };

  const handleSetPreset = (val) => {
    onSliderChange?.(val);
  };

  return (
    <section className="bg-white rounded-2xl p-2.5 sm:p-4 shadow-card border border-charcoal-border/80 flex flex-col gap-3">
      {/* Comparison Container Frame */}
      <div
        ref={containerRef}
        id="comparisonFrame"
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-charcoal/5 select-none shadow-inner group"
      >
        {/* Background Layer: AI Generated Design */}
        <img
          id="aiGeneratedImage"
          src={generatedSrc}
          alt="SketchSpace AI Generated Modern Interior Redesign"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          loading="eager"
        />

        {/* Foreground Layer (Clipped): Original Room Image */}
        <div
          id="originalClipContainer"
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none select-none transition-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            id="originalImage"
            src={originalSrc}
            alt="Original Living Room Photo"
            className="absolute top-0 left-0 h-full max-w-none object-cover pointer-events-none select-none"
            style={{ width: containerWidth ? `${containerWidth}px` : '100%' }}
            loading="eager"
          />
        </div>

        {/* Floating Label: Original Room (Top Left) */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-charcoal/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md ring-1 ring-white/10">
            <Camera className="w-3 h-3 text-white/80 shrink-0" />
            <span>Original Room</span>
          </div>
        </div>

        {/* Floating Label: AI Generated (Top Right) */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-teal/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md ring-1 ring-aqua/40">
            <Sparkles className="w-3.5 h-3.5 text-aqua shrink-0" />
            <span>AI Generated</span>
          </div>
        </div>

        {/* Vertical Divider & Circular Drag Handle */}
        <div
          id="sliderDivider"
          className="absolute inset-y-0 z-20 pointer-events-none flex items-center justify-center -translate-x-1/2 transition-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Vertical white divider line */}
          <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]" />

          {/* Circular handle */}
          <div className="absolute w-10 h-10 rounded-full bg-white text-teal flex items-center justify-center shadow-handle border-2 border-teal transition-transform group-hover:scale-105">
            <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
            </svg>
          </div>
        </div>

        {/* Accessible Range Slider Overlay */}
        <input
          id="splitRangeInput"
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleRangeChange}
          aria-label="Before and after split slider"
          className="slider-range"
        />
      </div>

      {/* Toolbar Beneath Comparison Frame */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        {/* Left: Presets Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-cream p-1 rounded-lg border border-charcoal-border/70">
            {/* Original preset */}
            <button
              type="button"
              id="presetBtnOriginal"
              onClick={() => handleSetPreset(100)}
              className={`preset-split-btn px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer ${sliderPosition === 100
                ? 'font-semibold bg-white text-teal shadow-2xs border border-teal/20'
                : 'font-medium text-charcoal hover:text-teal hover:bg-white'
                }`}
            >
              <img
                src={originalSrc}
                className="w-4 h-4 rounded object-cover border border-charcoal-border"
                alt="Thumb original"
              />
              <span>Original</span>
            </button>

            {/* 50 / 50 Split preset */}
            <button
              type="button"
              id="presetBtnSplit"
              onClick={() => handleSetPreset(50)}
              className={`preset-split-btn px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer ${sliderPosition === 50
                ? 'font-semibold bg-white text-teal shadow-2xs border border-teal/20'
                : 'font-medium text-charcoal hover:text-teal hover:bg-white'
                }`}
            >
              <Columns2 className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>50 / 50 Split</span>
            </button>

            {/* AI Render preset */}
            <button
              type="button"
              id="presetBtnAI"
              onClick={() => handleSetPreset(0)}
              className={`preset-split-btn px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 cursor-pointer ${sliderPosition === 0
                ? 'font-semibold bg-white text-teal shadow-2xs border border-teal/20'
                : 'font-medium text-charcoal hover:text-teal hover:bg-white'
                }`}
            >
              <img
                src={generatedSrc}
                className="w-4 h-4 rounded object-cover border border-teal/40"
                alt="Thumb AI render"
              />
              <span>AI Render</span>
            </button>
          </div>

          <span className="text-charcoal-light hidden sm:inline">• Drag slider or tap presets</span>
        </div>

        {/* Right: Download & Save Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-charcoal-border bg-white text-charcoal hover:bg-cream-subtle hover:text-teal font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-charcoal-muted shrink-0" />
              <span>{isDownloading ? 'Downloading...' : 'Download Image'}</span>
            </button>
          )}

        </div>
      </div>
    </section>
  );
}
