import { useEffect, useRef, useState } from 'react';
import { Download, Check, Sparkles, SlidersHorizontal, RotateCcw } from 'lucide-react';

/**
 * BeforeAfterSlider — Interactive split slider comparing original vs AI render.
 * Supports touch, drag, preset buttons (Original 100%, Split 50%, AI 0%), and image download.
 */
export default function BeforeAfterSlider({
  beforeImage = '/stitch/original-sample.png',
  afterImage = '/stitch/ai-generated-sample.png',
  beforeLabel = 'Original Room',
  afterLabel = 'AI Generated',
  onSave,
  onNotify,
}) {
  const [splitPos, setSplitPos] = useState(50);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const originalImgRef = useRef(null);

  // Sync width of clipped image to container width so background/foreground stay aligned
  useEffect(() => {
    const syncWidth = () => {
      if (containerRef.current && originalImgRef.current) {
        originalImgRef.current.style.width = `${containerRef.current.offsetWidth}px`;
      }
    };
    syncWidth();
    window.addEventListener('resize', syncWidth);
    return () => window.removeEventListener('resize', syncWidth);
  }, []);

  const handleDownload = () => {
    if (!afterImage) return;
    try {
      const link = document.createElement('a');
      link.href = afterImage;
      link.download = `sketchspace-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onNotify?.('Downloading redesigned room image...');
    } catch {
      onNotify?.('Failed to trigger download.');
    }
  };

  const handleSave = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onSave?.();
    onNotify?.('Design saved to your SketchSpace project!');
  };

  const resetSplit = () => {
    setSplitPos(50);
    onNotify?.('Comparison reset to 50% split.');
  };

  return (
    <section className="bg-white rounded-2xl p-2.5 sm:p-4 shadow-card border border-charcoal-border/80 flex flex-col gap-3">
      {/* Comparison Frame */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-charcoal/5 select-none shadow-inner group"
      >
        {/* Background Layer: AI Generated Design */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Foreground Layer (Clipped): Original Room Image */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none transition-[width] duration-75"
          style={{ width: `${splitPos}%` }}
        >
          <img
            ref={originalImgRef}
            src={beforeImage}
            alt={beforeLabel}
            className="absolute top-0 left-0 h-full max-w-none object-cover"
          />
        </div>

        {/* Floating Labels */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-charcoal/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md ring-1 ring-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            {beforeLabel}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-teal/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-md ring-1 ring-aqua/40">
            <Sparkles className="w-3.5 h-3.5 text-aqua" />
            {afterLabel}
          </div>
        </div>

        {/* Vertical Divider & Circular Drag Handle */}
        <div
          className="absolute inset-y-0 z-20 pointer-events-none flex items-center justify-center -translate-x-1/2"
          style={{ left: `${splitPos}%` }}
        >
          <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
          <div className="absolute w-10 h-10 rounded-full bg-white text-teal flex items-center justify-center shadow-handle border-2 border-teal transition-transform group-hover:scale-105">
            <SlidersHorizontal className="w-4 h-4 text-teal" />
          </div>
        </div>

        {/* Accessible Range Input Overlay */}
        <input
          type="range"
          min="0"
          max="100"
          value={splitPos}
          onChange={(e) => setSplitPos(Number(e.target.value))}
          aria-label="Before and after split slider"
          className="absolute inset-0 opacity-0 w-full h-full cursor-ew-resize z-30 m-0"
        />

        {/* Center 50% Reset floating button */}
        <button
          type="button"
          onClick={resetSplit}
          title="Reset split to center (50%)"
          className="absolute bottom-3 right-3 z-30 bg-white/90 hover:bg-white text-charcoal hover:text-teal p-1.5 rounded-lg shadow-sm backdrop-blur-xs text-xs font-semibold flex items-center gap-1 border border-charcoal-border/70 transition-all hover:scale-105"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal" />
          <span className="hidden sm:inline text-[11px]">Center 50%</span>
        </button>
      </div>

      {/* Preset Buttons & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-cream p-1 rounded-lg border border-charcoal-border/70">
            <button
              type="button"
              onClick={() => setSplitPos(100)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                splitPos === 100
                  ? 'bg-white text-teal shadow-xs font-semibold border border-teal/20'
                  : 'text-charcoal hover:text-teal hover:bg-white'
              }`}
            >
              <img
                src={beforeImage}
                className="w-4 h-4 rounded object-cover border border-charcoal-border"
                alt="Thumb original"
              />
              <span>Original</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitPos(50)}
              className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                splitPos === 50
                  ? 'bg-white text-teal shadow-xs font-semibold border border-teal/20'
                  : 'text-charcoal font-medium hover:text-teal hover:bg-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal" />
              <span>50 / 50 Split</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitPos(0)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                splitPos === 0
                  ? 'bg-white text-teal shadow-xs font-semibold border border-teal/20'
                  : 'text-charcoal hover:text-teal hover:bg-white'
              }`}
            >
              <img
                src={afterImage}
                className="w-4 h-4 rounded object-cover border border-teal/40"
                alt="Thumb AI render"
              />
              <span>AI Render</span>
            </button>
          </div>
          <span className="text-charcoal-light hidden sm:inline">• Drag slider or tap presets</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-charcoal-border bg-white text-charcoal hover:bg-cream-subtle hover:text-teal font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-muted" />
            <span>Download Image</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal text-white hover:bg-teal-dark font-semibold transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-aqua" /> : <Sparkles className="w-3.5 h-3.5 text-aqua" />}
            <span>{copied ? 'Saved!' : 'Save Design'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
