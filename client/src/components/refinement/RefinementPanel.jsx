/**
 * RefinementPanel.jsx
 * 
 * Refinement Dock with modern, balanced iconography.
 * Features:
 * - Subtle inline Wand2 icon on title
 * - Purposeful Lucide icons for quick suggestion chips (Maximize2, Sun, Leaf, Palette)
 * - ShieldCheck and status indicators for system state
 * - Clean Sparkles on the primary Refine Design CTA
 */

import React, { useRef } from 'react';
import {
  Wand2,
  Sparkles,
  Paperclip,
  Mic,
  Maximize2,
  Sun,
  Leaf,
  Palette,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const QUICK_CHIPS = [
  {
    label: 'Make the desk larger',
    text: 'Make the desk larger and position closer to natural light',
    icon: Maximize2,
  },
  {
    label: 'Add warm lighting',
    text: 'Add warm ambient cove lighting and soft floor lamps',
    icon: Sun,
  },
  {
    label: 'Add plants',
    text: 'Add lush indoor olive and fiddle leaf fig plants',
    icon: Leaf,
  },
  {
    label: 'Switch to Japandi wood tones',
    text: 'Switch to Japandi wood tones with light oak and neutral linens',
    icon: Palette,
  },
];

export default function RefinementPanel({
  instruction = '',
  onInstructionChange,
  onSubmit,
  isRefining = false,
  refineProgress = 35,
  refineStepLabel = 'Analyzing layout & preserving geometry...',
  error = null,
  successNotice = null,
  onRetry = null,
  roomType = 'Living Room',
  style = 'Modern',
  onTriggerToast,
}) {
  const textareaRef = useRef(null);

  const handleChipClick = (chipText) => {
    if (isRefining) return;
    const current = (instruction || '').trim();
    if (current.length > 0) {
      onInstructionChange?.(`${current}, ${chipText.toLowerCase()}`);
    } else {
      onInstructionChange?.(chipText);
    }
    textareaRef.current?.focus();
  };

  const handleAttach = () => {
    onTriggerToast?.('Reference image attachment dialog simulated.');
  };

  const handleVoice = () => {
    onTriggerToast?.('Listening for voice prompt instructions...');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  const charLength = (instruction || '').length;

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-card border border-charcoal-border/80 flex flex-col gap-4">
      {/* Header - Refined inline aesthetic */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-teal shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">Refinement Dock</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-aqua-soft text-teal border border-aqua/30">
              Smart Assistant
            </span>
          </div>
          <span className="text-xs text-charcoal-light hidden sm:inline">
            Room layout &amp; geometry locked
          </span>
        </div>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Type adjustments or choose prompt quick chips to iterate on this render in real time.
        </p>
      </div>

      {/* Main Refinement Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Input Textarea Container */}
        <div className="rounded-2xl border border-charcoal-border bg-cream/40 focus-within:bg-white focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20 transition-all p-3 shadow-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <textarea
              ref={textareaRef}
              id="refineInput"
              rows={2}
              maxLength={250}
              value={instruction}
              onChange={(e) => onInstructionChange?.(e.target.value)}
              disabled={isRefining}
              placeholder="Describe changes: 'Make the desk larger, add warm lighting, switch to Japandi wood tones...'"
              className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder-charcoal-light/70 focus:outline-none resize-none pt-1"
            />
            <div className="flex items-center gap-1 text-charcoal-light pt-1 shrink-0">
              <button
                type="button"
                onClick={handleAttach}
                className="p-1.5 rounded-lg hover:bg-cream hover:text-teal transition-colors cursor-pointer"
                title="Attach reference photo or material palette"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleVoice}
                className="p-1.5 rounded-lg hover:bg-cream hover:text-teal transition-colors cursor-pointer"
                title="Voice prompt input"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-charcoal-border/40 text-xs text-charcoal-light">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span>
                Iterating on{' '}
                <strong className="text-charcoal font-semibold">
                  {roomType} — {style}
                </strong>
              </span>
            </div>
            <span id="charCount" className="text-charcoal-light font-mono text-[11px]">
              {charLength} / 250
            </span>
          </div>
        </div>

        {/* Quick Suggestion Chips - Modern Lucide icons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-muted shrink-0">Quick chips:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.text)}
                  disabled={isRefining}
                  className="chip-btn inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cream hover:bg-teal-surface hover:text-teal text-charcoal border border-charcoal-border hover:border-teal/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-3 h-3 text-teal/80 shrink-0" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Banner & Action CTA */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div id="stateBanner" className="flex-1 min-h-[44px] flex items-center">
            {/* Loading State */}
            {isRefining ? (
              <div
                id="stateLoading"
                className="flex flex-col gap-1.5 w-full bg-teal-surface px-3 py-2 rounded-xl border border-teal/20 animate-in fade-in"
              >
                <div className="flex items-center justify-between text-xs text-teal font-medium">
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-3.5 h-3.5 text-teal shrink-0" />
                    <span id="loadingStepLabel">{refineStepLabel}</span>
                  </div>
                  <span id="loadingPercentage" className="font-mono text-[11px] font-bold">
                    {refineProgress}%
                  </span>
                </div>
                <div className="w-full bg-teal/20 h-1.5 rounded-full overflow-hidden">
                  <div
                    id="loadingProgressBar"
                    className="bg-teal h-full transition-all duration-300"
                    style={{ width: `${refineProgress}%` }}
                  />
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div
                id="stateError"
                className="flex items-center justify-between w-full text-xs text-red-800 font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-200 animate-in fade-in"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error.message || 'Refinement timed out. Please retry your prompt.'}</span>
                </div>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="underline font-bold text-red-900 hover:text-red-700 ml-2 cursor-pointer shrink-0"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : successNotice ? (
              /* Success State */
              <div
                id="stateSuccess"
                className="flex items-center gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-full animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            ) : (
              /* Idle State */
              <div id="stateIdle" className="flex items-center gap-2 text-xs text-charcoal-muted">
                <ShieldCheck className="w-4 h-4 text-teal/80 shrink-0" />
                <span>Ready. Wall outlines, architectural doors, and spatial bounds will remain fixed.</span>
              </div>
            )}
          </div>

          {/* Action CTA Button */}
          <button
            id="refineSubmitBtn"
            type="submit"
            disabled={isRefining}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal text-white hover:bg-teal-dark font-semibold text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-aqua shrink-0" />
                <span>Refine Design</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
