import { LayoutTemplate } from 'lucide-react';
import { PRESETS } from '../lib/presets';

export default function PresetPicker({ onSelect }) {
  return (
    <section aria-labelledby="presets-title" className="rounded-2xl border border-stone-200 bg-white p-4 shadow-card">
      <h2 id="presets-title" className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand-teal">
        Preset sketches
      </h2>
      <p className="mb-3 text-sm text-stone-500">Load a starter floor plan. It replaces the current drawing (you can undo).</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-brand-cream px-3 py-2.5 text-left transition hover:border-brand-teal hover:bg-white"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white">
              <LayoutTemplate size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{p.label}</span>
              <span className="block text-xs text-stone-500">{p.hint}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
