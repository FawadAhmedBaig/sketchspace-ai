/**
 * ErrorMessage.jsx
 * 
 * Clean error banner that displays user-friendly failure feedback
 * and provides an actionable Retry button without losing state.
 * 
 * Flutter Developer Note:
 * Analogous to a SnackBar with an SnackBarAction, or a MaterialBanner.
 */

import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-red-50/90 border border-red-200/80 text-red-900 shadow-sm animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-red-100 text-red-600 shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-red-800">
            {title}
          </h4>
          <p className="text-sm text-red-700 mt-0.5 leading-snug">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
