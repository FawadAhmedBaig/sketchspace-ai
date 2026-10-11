import { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Loader2, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { useBackendStatus, useGenerateDesign } from '../hooks/useGenerateDesign';
import {
  getDesignMeta,
  saveDesignMeta,
  saveCanvasSketch,
  saveLatestRender,
  saveRefinementHistory,
} from '../utils/persistence';

/**
 * STAND-IN for Tayyab's controls + results panel.
 * Tayyab: delete this folder and render your own selectors/results in the <SketchWorkspace> slot.
 * Everything real lives in useGenerateDesign() + lib/api.js, so only the markup below is throwaway.
 *
 * Room/style values are free text that the backend pastes into its prompt, so send readable labels.
 */
const ROOM_TYPES = ['Bedroom', 'Living Room', 'Studio Apartment', 'Home Office', 'Kitchen', 'Bathroom'];
const STYLES = ['Modern Japandi', 'Scandinavian', 'Minimalist', 'Mid-Century Modern', 'Industrial', 'Bohemian'];

const field = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-teal';

export default function DemoGeneratePanel({ canExport, getImage, onGenerationComplete }) {
  const savedMeta = getDesignMeta() || {};
  const [room_type, setRoomType] = useState(savedMeta.room_type || savedMeta.roomType || ROOM_TYPES[0]);
  const [style, setStyle] = useState(savedMeta.style || STYLES[0]);
  const [prompt, setPrompt] = useState(savedMeta.prompt || '');
  const [preserve_layout, setPreserve] = useState(savedMeta.preserve_layout !== undefined ? savedMeta.preserve_layout : true);
  const { status, result, error, isLoading, generate, cancel } = useGenerateDesign();
  const backend = useBackendStatus();

  // Save metadata to localStorage on change
  useEffect(() => {
    saveDesignMeta({ room_type, roomType: room_type, style, prompt, preserve_layout });
  }, [room_type, style, prompt, preserve_layout]);

  const onSubmit = async () => {
    const imageSnapshot = getImage();
    const res = await generate(getImage, { room_type, style, prompt: prompt.trim(), preserve_layout });
    // If generation was successful, navigate to refinement page
    if (res && onGenerationComplete) {
      const sketchDataUrl = imageSnapshot?.ok ? imageSnapshot.dataUrl : null;
      saveCanvasSketch(sketchDataUrl);
      saveLatestRender(res.imageDataUrl);
      saveDesignMeta({
        room_type,
        roomType: room_type,
        style,
        prompt: prompt.trim(),
        preserve_layout,
        anchors: res.anchors,
      });
      saveRefinementHistory([
        {
          type: 'initial',
          instruction: 'Initial design generated from sketch',
          image: res.imageDataUrl,
          timestamp: Date.now(),
        },
      ]);
      onGenerationComplete(res, {
        sketchDataUrl,
        room_type,
        style,
        prompt: prompt.trim(),
      });
    }
  };

  const chip = {
    checking: ['bg-stone-100 text-stone-500', 'Connecting to server…'],
    online: ['bg-brand-aqua/20 text-brand-teal-dark', 'Server online'],
    offline: ['bg-amber-100 text-amber-800', 'Server unreachable'],
  }[backend.status];

  return (
    <section className="rounded-2xl border border-dashed border-stone-300 bg-white p-4" aria-labelledby="demo-gen-title">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="demo-gen-title" className="text-sm font-semibold uppercase tracking-wide text-brand-teal">
          Generate (stand-in)
        </h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chip[0]}`} role="status">
          {chip[1]}
          {backend.status === 'offline' && (
            <button type="button" onClick={backend.recheck} aria-label="Retry connection">
              <RefreshCw size={12} />
            </button>
          )}
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Room type
          <select className={`${field} mt-1`} value={room_type} onChange={(e) => setRoomType(e.target.value)} disabled={isLoading}>
            {ROOM_TYPES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Style
          <select className={`${field} mt-1`} value={style} onChange={(e) => setStyle(e.target.value)} disabled={isLoading}>
            {STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Details (optional)
          <textarea className={`${field} mt-1`} rows={2} maxLength={500} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading} placeholder="e.g. warm oak floors, large plants" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-brand-teal" checked={preserve_layout} onChange={(e) => setPreserve(e.target.checked)} disabled={isLoading} />
          Preserve my layout
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canExport || isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Wand2 size={16} aria-hidden="true" />}
          {isLoading ? 'Generating…' : 'Generate & Refine'}
          {!isLoading && <ArrowRight size={14} aria-hidden="true" />}
        </button>
        {!canExport && <p className="text-xs text-stone-500">Draw a sketch, load a preset or upload an image to enable generation.</p>}
        {isLoading && (
          <p className="text-xs text-stone-500" role="status">
            This can take up to a minute (longer if the server is waking up).{' '}
            <button type="button" className="font-medium text-brand-teal underline" onClick={cancel}>Cancel</button>
          </p>
        )}
      </div>

      {status === 'error' && error && (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error.message}</span>
        </div>
      )}
    </section>
  );
}
