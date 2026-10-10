import { useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useBackendStatus, useGenerateDesign } from '../../hooks/useGenerateDesign';
import DesignSelectors, { DEFAULT_ROOM_TYPES, DEFAULT_STYLES } from './DesignSelectors';
import BeforeAfterSlider from './BeforeAfterSlider';
import RefinementDock from './RefinementDock';

/**
 * RefinedGeneratePanel — Tayyab's controls + results panel for SketchWorkspace.
 * Replaces DemoGeneratePanel while utilizing useGenerateDesign() and lib/api.js.
 */
export default function RefinedGeneratePanel({ canExport, getImage, onOpenFullRefine }) {
  const [roomType, setRoomType] = useState(DEFAULT_ROOM_TYPES[0]);
  const [style, setStyle] = useState(DEFAULT_STYLES[0]);
  const [prompt, setPrompt] = useState('');
  const [preserveLayout, setPreserveLayout] = useState(true);

  const { status, result, error, isLoading, generate, cancel } = useGenerateDesign();
  const backend = useBackendStatus();

  const handleGenerate = () => {
    generate(getImage, {
      room_type: roomType,
      style,
      prompt: prompt.trim(),
      preserve_layout: preserveLayout,
    });
  };

  const chip = {
    checking: ['bg-stone-100 text-stone-500', 'Connecting to server…'],
    online: ['bg-brand-aqua/20 text-brand-teal-dark', 'Server online'],
    offline: ['bg-amber-100 text-amber-800', 'Server unreachable'],
  }[backend.status] || ['bg-stone-100 text-stone-500', 'Checking…'];

  // Current sketch or uploaded image from workspace
  const currentImage = typeof getImage === 'function' ? getImage() : null;
  const originalImageSrc = currentImage?.ok ? currentImage.dataUrl : '/stitch/original-sample.png';
  const generatedImageSrc = result?.imageDataUrl || '/stitch/ai-generated-sample.png';

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Card */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-surface text-teal">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-teal">
              Design Controls
            </h2>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chip[0]}`}
            role="status"
          >
            {chip[1]}
            {backend.status === 'offline' && (
              <button
                type="button"
                onClick={backend.recheck}
                aria-label="Retry connection"
                className="hover:text-amber-950"
              >
                <RefreshCw size={12} />
              </button>
            )}
          </span>
        </div>

        <div className="space-y-3">
          {/* Room & Style Chips */}
          <DesignSelectors
            roomType={roomType}
            style={style}
            onRoomTypeChange={setRoomType}
            onStyleChange={setStyle}
            disabled={isLoading}
          />

          {/* Details / Prompt input */}
          <label className="block text-sm font-medium">
            Details (optional)
            <textarea
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
              rows={2}
              maxLength={500}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. warm oak floors, large plants, ambient lighting"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-brand-teal"
              checked={preserveLayout}
              onChange={(e) => setPreserveLayout(e.target.checked)}
              disabled={isLoading}
            />
            Preserve my room layout &amp; geometry
          </label>

          {/* Action button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canExport || isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-teal-dark disabled:cursor-not-allowed disabled:opacity-40 shadow-soft"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 size={16} aria-hidden="true" />
            )}
            {isLoading ? 'Generating interior…' : 'Generate design'}
          </button>

          {!canExport && (
            <p className="text-xs text-stone-500">
              Draw a sketch, load a preset, or upload an image to enable generation.
            </p>
          )}

          {isLoading && (
            <p className="text-xs text-stone-500" role="status">
              This can take up to a minute (longer if the server is waking up).{' '}
              <button
                type="button"
                className="font-medium text-brand-teal underline"
                onClick={cancel}
              >
                Cancel
              </button>
            </p>
          )}
        </div>

        {status === 'error' && error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error.message}</span>
          </div>
        )}
      </section>

      {/* Results & Comparison Section */}
      {result ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-charcoal uppercase tracking-wide">
              Before / After Comparison Studio
            </h3>
            {onOpenFullRefine && (
              <button
                type="button"
                onClick={() =>
                  onOpenFullRefine({
                    beforeImage: originalImageSrc,
                    afterImage: result.imageDataUrl,
                    roomType,
                    style,
                  })
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:underline"
              >
                <span>Open Fullscreen Studio</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>

          <BeforeAfterSlider
            beforeImage={originalImageSrc}
            afterImage={result.imageDataUrl}
            beforeLabel="Your Sketch / Photo"
            afterLabel="AI Render"
          />

          {result.anchors && result.anchors.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs">
              <span className="font-semibold text-brand-teal">Detected spatial anchors:</span>
              <ul className="mt-1 list-inside list-disc text-stone-600">
                {result.anchors.map((anchor, i) => (
                  <li key={i}>{anchor}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Refinement Dock */}
          <RefinementDock
            roomType={roomType}
            style={style}
            isLoading={isLoading}
            status={status}
            onRefine={(refinePrompt) => {
              generate(getImage, {
                room_type: roomType,
                style,
                prompt: refinePrompt,
                preserve_layout: true,
              });
            }}
          />
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-4 text-center">
          <p className="text-xs text-stone-500">
            Once generated, the interactive Before/After comparison and Refinement Dock will appear here.
          </p>
          {onOpenFullRefine && (
            <button
              type="button"
              onClick={() => onOpenFullRefine({ roomType, style })}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-teal hover:underline"
            >
              <span>Preview Design &amp; Refine Screen with sample data</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
