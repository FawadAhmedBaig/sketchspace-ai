import { useEffect, useState } from 'react';
import { Brush, Eraser, Trash2, Undo2 } from 'lucide-react';

const toolBtn = (active) =>
  `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
    active
      ? 'border-brand-teal bg-brand-teal text-white shadow-sm'
      : 'border-stone-300 bg-white text-brand-charcoal hover:border-brand-teal hover:text-brand-teal'
  }`;
const plainBtn =
  'inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-brand-charcoal transition hover:border-brand-teal hover:text-brand-teal disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-300 disabled:hover:text-brand-charcoal';

export default function CanvasToolbar({ tool, onToolChange, brushSize, onBrushSizeChange, canUndo, onUndo, onClear }) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return undefined;
    const t = setTimeout(() => setConfirming(false), 4000); // auto-cancel
    return () => clearTimeout(t);
  }, [confirming]);

  return (
    <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing tools">
      <button type="button" className={toolBtn(tool === 'brush')} aria-pressed={tool === 'brush'} onClick={() => onToolChange('brush')}>
        <Brush size={16} aria-hidden="true" /> Brush
      </button>
      <button type="button" className={toolBtn(tool === 'eraser')} aria-pressed={tool === 'eraser'} onClick={() => onToolChange('eraser')}>
        <Eraser size={16} aria-hidden="true" /> Eraser
      </button>

      <label className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium">
        <span>Size</span>
        <input
          type="range"
          min={1}
          max={40}
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-24 accent-brand-teal sm:w-32"
          aria-label="Brush size"
        />
        <span className="w-6 text-right tabular-nums text-stone-500">{brushSize}</span>
      </label>

      <div className="ml-auto flex items-center gap-2">
        <button type="button" className={plainBtn} onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={16} aria-hidden="true" /> Undo
        </button>
        {confirming ? (
          <span className="flex items-center gap-1" role="alert">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => {
                setConfirming(false);
                onClear();
              }}
            >
              <Trash2 size={16} aria-hidden="true" /> Confirm clear
            </button>
            <button type="button" className={plainBtn} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" className={plainBtn} onClick={() => setConfirming(true)}>
            <Trash2 size={16} aria-hidden="true" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
