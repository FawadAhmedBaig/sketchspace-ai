/**
 * LoadingIndicator.jsx
 * 
 * Elegant inline or overlay loading spinner with dynamic status messages.
 * Uses Deep Teal (#0F6B63) and Soft Aqua (#4FD1C5) brand colors.
 * 
 * Flutter Developer Note:
 * In Flutter, this is similar to CircularProgressIndicator with a Column containing Text widgets.
 */

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingIndicator({
  message = 'Processing...',
  subtext = '',
  inline = false,
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (inline) {
    return (
      <div className="inline-flex items-center gap-2.5 text-[#0F6B63] font-medium" role="status">
        <Loader2 className={`${sizeClasses[size] || 'w-5 h-5'} animate-spin text-[#0F6B63]`} />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-white/95 border border-[#E5E7EB] shadow-sm backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-4 flex items-center justify-center">
        {/* Soft Aqua pulsing background glow */}
        <div className="absolute inset-0 rounded-full bg-[#4FD1C5]/20 blur-md animate-pulse" />
        
        {/* Deep Teal rotating spinner ring */}
        <div className="relative p-3 rounded-full bg-[#FAF9F6] border border-[#4FD1C5]/30">
          <Loader2 className="w-8 h-8 text-[#0F6B63] animate-spin" />
        </div>

        <div className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#4FD1C5]" />
        </div>
      </div>

      <p className="font-semibold text-[#1F2937] text-base mb-1 tracking-tight">
        {message}
      </p>

      {subtext && (
        <p className="text-xs text-[#4B5563] max-w-xs leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
}
