import { Home, Sparkles } from 'lucide-react';

export const DEFAULT_ROOM_TYPES = ['Living Room', 'Bedroom', 'Study', 'Office'];
export const DEFAULT_STYLES = ['Modern', 'Minimalist', 'Japandi', 'Cozy', 'Luxury'];

/**
 * DesignSelectors — Room Type & Interior Style pill selector bar from Stitch Design & Refine.
 */
export default function DesignSelectors({
  roomType = 'Living Room',
  style = 'Modern',
  onRoomTypeChange,
  onStyleChange,
  disabled = false,
  roomTypes = DEFAULT_ROOM_TYPES,
  styles = DEFAULT_STYLES,
}) {
  return (
    <div
      id="designSelectorsBar"
      className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-charcoal-border/80 flex flex-col gap-3"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Room Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Home className="w-3.5 h-3.5 text-teal" />
            Room Type:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {roomTypes.map((type) => {
              const active = roomType === type;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={disabled}
                  onClick={() => onRoomTypeChange?.(type)}
                  className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 border ${
                    active
                      ? 'font-semibold bg-teal text-white shadow-xs border-teal'
                      : 'font-medium bg-cream hover:bg-teal-surface text-charcoal hover:text-teal border-charcoal-border'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-aqua" />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px lg:h-6 lg:w-px bg-charcoal-border/70" />

        {/* Style Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-aqua" />
            Interior Style:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {styles.map((s) => {
              const active = style === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={disabled}
                  onClick={() => onStyleChange?.(s)}
                  className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 border ${
                    active
                      ? 'font-semibold bg-teal text-white shadow-xs border-teal'
                      : 'font-medium bg-cream hover:bg-teal-surface text-charcoal hover:text-teal border-charcoal-border'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-aqua" />}
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
