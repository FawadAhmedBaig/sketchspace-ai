/**
 * RefinementPanel.jsx
 * 
 * Refinement control panel positioned directly beneath the before/after comparison.
 * Accepts natural-language design instructions and provides quick-suggestion chips.
 * 
 * Flutter Developer Note:
 * In Flutter, this is analogous to a Card containing:
 * - Text('Refine Your Design')
 * - TextField(maxLines: 3, controller: textController)
 * - Wrap(children: chips.map((c) => ActionChip(...)))
 * - ElevatedButton(onPressed: isRefining ? null : handleSubmit, child: ...)
 * In React, we use controlled textarea component state (`value` + `onChange`).
 */

import React from 'react';
import { Sparkles, Loader2, Wand2, Lightbulb, CornerDownLeft } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'Add Plants',
  'Warm Lighting',
  'Change Rug Color',
  'Add Floating Shelves',
  'Make It Cozy',
];

export default function RefinementPanel({
  instruction,
  onInstructionChange,
  onSubmit,
  isRefining = false,
  disabled = false,
}) {
  const handleChipClick = (suggestion) => {
    if (isRefining) return;

    // If instruction is empty, set it directly; if non-empty, suggest appending or replacing cleanly
    if (!instruction || !instruction.trim()) {
      onInstructionChange(suggestion);
    } else {
      // Append naturally with comma
      const trimmed = instruction.trim();
      if (!trimmed.toLowerCase().includes(suggestion.toLowerCase())) {
        onInstructionChange(`${trimmed}, ${suggestion.toLowerCase()}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter for quick submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isRefining && instruction?.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isRefining && instruction?.trim()) {
      onSubmit();
    }
  };

  const canSubmit = Boolean(instruction && instruction.trim() && !isRefining && !disabled);

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#1F2937] tracking-tight">
              Refine Your Design
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4FD1C5]/15 text-[#0F6B63] border border-[#4FD1C5]/30">
              AI Iteration
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Describe what you would like to change in this room render.
          </p>
        </div>

        <div className="text-[11px] text-[#4B5563] flex items-center gap-1.5 self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F6B63]" />
          <span>Iterates on current design without resetting layout</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Multiline Instruction Input */}
        <div className="relative">
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRefining || disabled}
            placeholder="e.g. Add wooden floating shelves, make the rug cream, or add warm lighting..."
            aria-label="Refinement instruction"
            className={`
              w-full p-3.5 pb-8 text-sm rounded-xl border bg-[#FAF9F6] text-[#1F2937]
              placeholder:text-[#9CA3AF] resize-none
              focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4FD1C5] focus:border-[#0F6B63]
              transition-all
              ${isRefining ? 'opacity-60 cursor-not-allowed' : 'border-[#E5E7EB]'}
            `}
          />

          <div className="absolute bottom-2.5 right-3 flex items-center gap-2 text-[10px] text-[#9CA3AF] select-none pointer-events-none">
            <span className="hidden sm:inline">Press Ctrl+Enter to apply</span>
            <CornerDownLeft className="w-3 h-3 text-[#9CA3AF]" />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-[#4B5563]">
            <Lightbulb className="w-3.5 h-3.5 text-[#0F6B63]" />
            <span>Quick Suggestions:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((chip) => {
              const isActive = instruction?.toLowerCase().includes(chip.toLowerCase());
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  disabled={isRefining || disabled}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
                    ${
                      isActive
                        ? 'bg-[#0F6B63] text-white shadow-2xs border border-[#0F6B63]'
                        : 'bg-[#FAF9F6] text-[#1F2937] border border-[#E5E7EB] hover:border-[#4FD1C5] hover:bg-white active:scale-95'
                    }
                    ${isRefining ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  + {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button & Active Progress */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB]/70">
          <div className="text-xs text-[#4B5563] flex items-center gap-2">
            {isRefining ? (
              <div className="flex items-center gap-2 text-[#0F6B63] font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Applying your changes... Generating photorealistic update</span>
              </div>
            ) : (
              <span>Original room layout and perspective remain locked.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-6 py-2.5 rounded-xl font-semibold text-sm text-white
              bg-[#0F6B63] hover:bg-[#0b544e] active:bg-[#094540]
              shadow-sm transition-all duration-150 cursor-pointer
              focus:outline-none focus:ring-3 focus:ring-[#4FD1C5]/50
              ${!canSubmit ? 'opacity-50 cursor-not-allowed hover:bg-[#0F6B63]' : 'hover:shadow active:scale-98'}
            `}
          >
            {isRefining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Applying your changes...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-[#4FD1C5]" />
                <span>Refine Design</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
