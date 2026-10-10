import { useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { prepareUploadedImage } from '../lib/upload';

/** Drag-and-drop + file-picker uploader with validation and preview. */
export default function ImageUploader({ value, onUpload, onRemove, onError }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onUpload(await prepareUploadedImage(file));
    } catch (err) {
      onError(err.message || 'Upload failed. Please try another image.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ''; // allow re-selecting the same file
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className="sr-only"
      tabIndex={-1}
      aria-label="Choose an image file"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  if (value) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="grid min-h-[16rem] flex-1 place-items-center overflow-hidden rounded-xl border border-stone-200 bg-white">
          <img src={value.dataUrl} alt={`Uploaded preview: ${value.name}`} className="max-h-[60vh] w-full object-contain" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="min-w-0 flex-1 truncate text-stone-600">
            {value.name} · {value.width}×{value.height}
          </span>
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium hover:border-brand-teal hover:text-brand-teal">
            <RefreshCw size={16} aria-hidden="true" /> Replace
          </button>
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium hover:border-red-600 hover:text-red-600">
            <Trash2 size={16} aria-hidden="true" /> Remove
          </button>
        </div>
        {input}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragging ? 'border-brand-teal bg-brand-aqua/10' : 'border-stone-300 bg-white'
        }`}
      >
        {busy ? <Loader2 className="animate-spin text-brand-teal" size={36} aria-label="Processing image" /> : <UploadCloud className="text-brand-teal" size={36} aria-hidden="true" />}
        <p className="font-semibold">Drag & drop a sketch or floor plan here</p>
        <p className="text-sm text-stone-500">PNG, JPEG or WebP · up to 10 MB</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-teal-dark disabled:opacity-60"
        >
          <ImagePlus size={16} aria-hidden="true" /> Choose file
        </button>
        {input}
      </div>
    </div>
  );
}
