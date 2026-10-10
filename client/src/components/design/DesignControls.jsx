/**
 * DesignControls.jsx
 * 
 * Controls for room type, interior style, layout preservation,
 * and initial AI generation parameters.
 * Can be used standalone during development or integrated with Rahma's workspace canvas.
 * 
 * Flutter Developer Note:
 * In Flutter, this is analogous to a Form with:
 * - DropdownButtonFormField for room type & style
 * - SwitchListTile for "Preserve My Layout"
 * - TextFormField for the additional prompt
 * - ElevatedButton for "Generate Design"
 */

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Loader2,
  ChevronDown,
  Upload,
} from 'lucide-react';

const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining Room',
  'Home Office',
  'Bathroom',
];

const STYLES = [
  'Modern',
  'Scandinavian',
  'Japandi',
  'Industrial',
  'Bohemian',
  'Minimalist',
  'Coastal',
  'Mid-Century Modern',
];

export default function DesignControls({
  roomType = 'Living Room',
  onRoomTypeChange,
  style = 'Modern',
  onStyleChange,
  preserveLayout = true,
  onPreserveLayoutChange,
  prompt = '',
  onPromptChange,
  onGenerate,
  isGenerating = false,
  onImageUpload,
  disabled = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && onImageUpload) {
        onImageUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs transition-all">
      {/* Top summary row / collapse toggle for compact viewing */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] text-[#0F6B63]">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F2937]">
              Design Parameters & Style
            </h3>
            <p className="text-[11px] text-[#4B5563]">
              Configure room characteristics and architectural guidelines
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-[#0F6B63] font-medium hover:underline inline-flex items-center gap-1 sm:hidden cursor-pointer"
        >
          <span>{isExpanded ? 'Hide' : 'Options'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden sm:block'}`}>
        {/* Row 1: Room Type & Style Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Room Type */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              Room Type
            </label>
            <div className="relative">
              <select
                value={roomType}
                onChange={(e) => onRoomTypeChange(e.target.value)}
                disabled={isGenerating || disabled}
                className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-[#FAF9F6] text-[#1F2937] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] focus:border-[#0F6B63] transition-all cursor-pointer"
              >
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#4B5563] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Interior Style */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              Interior Style
            </label>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => onStyleChange(e.target.value)}
                disabled={isGenerating || disabled}
                className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-[#FAF9F6] text-[#1F2937] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] focus:border-[#0F6B63] transition-all cursor-pointer"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#4B5563] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Preserve Layout Toggle & Upload Preset Option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E5E7EB]">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-[#4FD1C5]/20 text-[#0F6B63] shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                <span>Preserve My Layout</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-[#4B5563] mt-0.5">
                Locks wall bounds and furniture positioning from your original sketch
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
            <input
              type="checkbox"
              checked={preserveLayout}
              onChange={(e) => onPreserveLayoutChange(e.target.checked)}
              disabled={isGenerating || disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4FD1C5] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6B63]"></div>
          </label>
        </div>

        {/* Row 3: Additional Initial Prompt */}
        <div>
          <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">
            Initial Prompt & Specific Notes (Optional)
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isGenerating || disabled}
            placeholder="e.g. Warm natural sunlight through east-facing window, light oak textures"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] bg-[#FAF9F6] text-[#1F2937] placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] focus:border-[#0F6B63] transition-all"
          />
        </div>

        {/* Row 4: Action Footer (Upload sketch & Generate) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Standalone Upload Control (allows testing different sketches) */}
          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-xl cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-[#0F6B63]" />
            <span>Upload New Sketch</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Generate Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || disabled}
            className={`
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white
              bg-[#0F6B63] hover:bg-[#0b544e] active:bg-[#094540]
              shadow-2xs transition-all cursor-pointer
              focus:outline-none focus:ring-3 focus:ring-[#4FD1C5]/50
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow active:scale-98'}
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Design...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#4FD1C5]" />
                <span>Generate Initial Design</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
