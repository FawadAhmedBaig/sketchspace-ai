import { useState } from 'react';
import {
  Sparkles,
  Paperclip,
  Mic,
  Info,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const QUICK_CHIPS = [
  { icon: '📐', text: 'Make the desk larger and position closer to natural light', label: 'Make the desk larger' },
  { icon: '✨', text: 'Add warm ambient cove lighting and soft floor lamps', label: 'Add warm lighting' },
  { icon: '🌿', text: 'Add lush indoor olive and fiddle leaf fig plants', label: 'Add plants' },
  { icon: '🪵', text: 'Switch to Japandi wood tones with light oak and neutral linens', label: 'Switch to Japandi wood tones' },
];

/**
 * RefinementDock — Natural language design iteration dock with quick prompt chips
 * and responsive state banners (idle, loading, success, error).
 */
export default function RefinementDock({
  roomType = 'Living Room',
  style = 'Modern',
  onRefine,
  isLoading = false,
  status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
  errorMessage = '',
  onRetry,
  onNotify,
}) {
  const [prompt, setPrompt] = useState('');

  const handleChipClick = (chipText) => {
    setPrompt((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chipText;
      return `${trimmed}, ${chipText.toLowerCase()}`;
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      onNotify?.('Please describe what you would like to change.');
      return;
    }
    onRefine?.(cleanPrompt);
  };

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-card border border-charcoal-border/80 flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-surface flex items-center justify-center text-teal shadow-xs">
              <Sparkles className="w-4 h-4 text-teal" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-charcoal">Refinement Dock</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-aqua-soft text-teal border border-aqua/30">
              Smart Assistant
            </span>
          </div>
          <span className="text-xs text-charcoal-light hidden sm:inline">
            Room layout &amp; geometry locked
          </span>
        </div>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 ml-9">
          Type adjustments or choose prompt quick chips to iterate on this render in real time.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="rounded-2xl border border-charcoal-border bg-cream/40 focus-within:bg-white focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20 transition-all p-3 shadow-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <textarea
              rows={2}
              maxLength={250}
              disabled={isLoading}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe changes: 'Make the desk larger, add warm lighting, switch to Japandi wood tones...'"
              className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder-charcoal-light/70 focus:outline-none resize-none pt-1"
            />
            <div className="flex items-center gap-1 text-charcoal-light pt-1">
              <button
                type="button"
                onClick={() => onNotify?.('Attach reference photo feature active in full mode.')}
                className="p-1.5 rounded-lg hover:bg-cream hover:text-teal transition-colors"
                title="Attach reference photo or material palette"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNotify?.('Voice prompt input listening...')}
                className="p-1.5 rounded-lg hover:bg-cream hover:text-teal transition-colors"
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
            <span className="text-charcoal-light font-mono text-[11px]">
              {prompt.length} / 250
            </span>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-muted shrink-0">Quick chips:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleChipClick(chip.text)}
                className="chip-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-cream hover:bg-teal-surface hover:text-teal text-charcoal border border-charcoal-border hover:border-teal/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* State Banner & Submit */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-h-[44px] flex items-center">
            {status === 'loading' || isLoading ? (
              <div className="flex flex-col gap-1.5 w-full bg-teal-surface px-3 py-2 rounded-xl border border-teal/20">
                <div className="flex items-center justify-between text-xs text-teal font-medium">
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-3.5 h-3.5 text-teal" />
                    <span>Analyzing layout &amp; preserving geometry...</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">In progress</span>
                </div>
                <div className="w-full bg-teal/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal h-full animate-pulse transition-all duration-300 w-3/5" />
                </div>
              </div>
            ) : status === 'success' ? (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 w-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Design updated! 50/50 comparison refreshed with latest prompt.</span>
              </div>
            ) : status === 'error' ? (
              <div className="flex items-center justify-between w-full text-xs text-red-800 font-medium bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{errorMessage || 'Refinement timed out. Please retry your prompt.'}</span>
                </div>
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="underline font-bold text-red-900 hover:text-red-700 ml-2"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                <Info className="w-4 h-4 text-teal" />
                <span>Ready. Wall outlines, architectural doors, and spatial bounds will remain fixed.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal text-white hover:bg-teal-dark font-semibold text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-aqua" />
            ) : (
              <Sparkles className="w-4 h-4 text-aqua" />
            )}
            <span>{isLoading ? 'Refining…' : 'Refine Design'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
