import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, PencilRuler, Upload, X } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import CanvasToolbar from './CanvasToolbar';
import ImageUploader from './ImageUploader';
import PresetPicker from './PresetPicker';
import { formatImageForBackend, parseDataUrl } from '../lib/exportImage';
import { getCanvasSketch, saveCanvasSketch, clearSketchSpaceStorage } from '../utils/persistence';

/**
 * SketchWorkspace — canvas + upload + presets, with a slot on the right for the parent's UI.
 *
 * Props
 *  - onImageChange(result)  debounced (300 ms); `result` has the same shape as getImage()
 *  - children               node OR render-prop: ({ canExport, getImage }) => node
 *                           rendered in the right column under the presets (selectors, results, ...)
 *
 * Ref API (useRef + ref={...})
 *  - getImage() => { ok:true, source:'drawing'|'upload', mimeType, dataUrl, base64, imageForBackend, width, height }
 *               |  { ok:false, error:string }
 */
const SketchWorkspace = forwardRef(function SketchWorkspace({ onImageChange, onReset, children }, ref) {
  const canvasRef = useRef(null);
  const initialSavedSketch = useRef(getCanvasSketch());
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(6);
  const [canUndo, setCanUndo] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(() => Boolean(initialSavedSketch.current));
  const [revision, setRevision] = useState(0);
  const [upload, setUpload] = useState(null);
  const [error, setError] = useState('');

  const canExport = mode === 'upload' ? !!upload : hasDrawing;

  const getImage = useCallback(() => {
    let dataUrl;
    let source;
    let size = {};
    if (mode === 'upload') {
      if (!upload) return { ok: false, error: 'Upload an image before generating.' };
      dataUrl = upload.dataUrl;
      source = 'upload';
      size = { width: upload.width, height: upload.height };
    } else {
      const canvas = canvasRef.current;
      if (!canvas || canvas.isBlank()) return { ok: false, error: 'The canvas is empty. Draw a sketch or load a preset first.' };
      dataUrl = canvas.toDataURL();
      source = 'drawing';
      size = { width: 1200, height: 800 };
    }
    const parsed = parseDataUrl(dataUrl);
    if (!parsed) return { ok: false, error: 'Could not read the image. Please try again.' };
    return {
      ok: true,
      source,
      mimeType: parsed.mimeType,
      dataUrl, // always "data:image/...;base64,..."
      base64: parsed.base64, // raw payload only
      imageForBackend: formatImageForBackend(dataUrl), // what to put in image_base64
      ...size,
    };
  }, [mode, upload]);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setUpload(null);
    setHasDrawing(false);
    clearSketchSpaceStorage();
    setError('');
    setRevision((r) => r + 1);
    onReset?.();
  }, [onReset]);

  useImperativeHandle(ref, () => ({
    getImage,
    clearCanvas: handleClear,
  }), [getImage, handleClear]);

  // Save current sketch to localStorage whenever the canvas or upload changes
  useEffect(() => {
    if (mode === 'draw' && hasDrawing && canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL();
        saveCanvasSketch(dataUrl);
      } catch (e) {
        console.warn('[SketchWorkspace] Could not persist canvas sketch:', e);
      }
    } else if (mode === 'upload' && upload?.dataUrl) {
      saveCanvasSketch(upload.dataUrl);
    }
  }, [revision, hasDrawing, mode, upload]);

  // Notify the parent whenever the exportable image changes (debounced).
  const onImageChangeRef = useRef(onImageChange);
  onImageChangeRef.current = onImageChange;
  useEffect(() => {
    if (!onImageChangeRef.current) return undefined;
    const t = setTimeout(() => onImageChangeRef.current?.(getImage()), 300);
    return () => clearTimeout(t);
  }, [getImage, revision]);

  const showError = (msg) => setError(msg);
  const loadPreset = (id) => {
    setError('');
    setMode('draw');
    // wait one frame so the canvas is visible/mounted before drawing
    requestAnimationFrame(() => canvasRef.current?.loadPreset(id));
  };

  const tab = (id, Icon, text) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => {
        setMode(id);
        setError('');
      }}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        mode === id ? 'bg-brand-teal text-white shadow-sm' : 'text-brand-charcoal hover:bg-stone-100'
      }`}
    >
      <Icon size={16} aria-hidden="true" /> {text}
    </button>
  );

  const slot = typeof children === 'function' ? children({ canExport, getImage }) : children;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-label="Sketch workspace" className="min-w-0 rounded-2xl border border-stone-200 bg-white p-3 shadow-card sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Input mode" className="inline-flex gap-1 rounded-xl border border-stone-200 bg-brand-cream p-1">
            {tab('draw', PencilRuler, 'Draw')}
            {tab('upload', Upload, 'Upload')}
          </div>
          <span
            role="status"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              canExport ? 'bg-brand-aqua/20 text-brand-teal-dark' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {canExport ? <CheckCircle2 size={14} aria-hidden="true" /> : <AlertCircle size={14} aria-hidden="true" />}
            {canExport ? 'Sketch ready' : mode === 'upload' ? 'Upload an image to continue' : 'Draw or load a preset to continue'}
          </span>
        </div>

        {error && (
          <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <button type="button" aria-label="Dismiss error" onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Both panes stay mounted so switching modes never loses the drawing. */}
        <div hidden={mode !== 'draw'} className="space-y-3">
          <CanvasToolbar
            tool={tool}
            onToolChange={setTool}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            canUndo={canUndo}
            onUndo={() => canvasRef.current?.undo()}
            onClear={handleClear}
          />
          <div className="overflow-hidden rounded-xl border border-stone-300 shadow-inner">
            <DrawingCanvas
              ref={canvasRef}
              tool={tool}
              brushSize={brushSize}
              initialImage={initialSavedSketch.current}
              onHistoryChange={setCanUndo}
              onChange={({ hasContent }) => {
                setHasDrawing(hasContent);
                setRevision((r) => r + 1);
              }}
            />
          </div>
        </div>

        <div hidden={mode !== 'upload'} className="rounded-xl border border-stone-200 bg-brand-cream">
          <ImageUploader
            value={upload}
            onUpload={(img) => {
              setError('');
              setUpload(img);
              setRevision((r) => r + 1);
            }}
            onRemove={() => {
              setUpload(null);
              setRevision((r) => r + 1);
            }}
            onError={showError}
          />
        </div>
      </section>

      <aside className="min-w-0 space-y-4">
        <PresetPicker onSelect={loadPreset} />
        {slot}
      </aside>
    </div>
  );
});

export default SketchWorkspace;
