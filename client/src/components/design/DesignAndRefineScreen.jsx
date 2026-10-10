/**
 * DesignAndRefineScreen.jsx
 * 
 * The primary Design & Refine feature screen for SketchSpace AI.
 * Contains:
 * - Header with branding, mode indicator, and Download Design action
 * - Centerpiece Before/After Comparison Slider
 * - Immediate Refinement Panel with natural-language input & suggestion chips
 * - Design controls for room type, interior style, and layout preservation
 * - Real-time error handling with retry capability
 * 
 * Integration Note:
 * Designed to work standalone or be plugged directly into Rahma's canvas workspace:
 * `<DesignAndRefineScreen originalImage={canvasSnapshot} onBackToWorkspace={...} />`
 */

import React from 'react';
import AppHeader from '../layout/AppHeader';
import BeforeAfterSlider from '../comparison/BeforeAfterSlider';
import RefinementPanel from '../refinement/RefinementPanel';
import DesignControls from './DesignControls';
import ErrorMessage from '../feedback/ErrorMessage';
import { useDesignWorkflow } from '../../hooks/useDesignWorkflow';
import { CheckCircle2, Info, Sparkles, Sliders } from 'lucide-react';

export default function DesignAndRefineScreen({
  initialOriginalImage,
  initialGeneratedImage,
  onBackToWorkspace,
}) {
  const workflow = useDesignWorkflow({
    originalImage: initialOriginalImage,
    generatedImage: initialGeneratedImage,
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2937] flex flex-col font-sans antialiased">
      {/* 1. TOP HEADER */}
      <AppHeader
        roomType={workflow.roomType}
        style={workflow.style}
        onBackToWorkspace={onBackToWorkspace}
        onDownloadDesign={workflow.handleDownload}
        isDownloading={workflow.isDownloading}
        hasGeneratedDesign={Boolean(workflow.currentGeneratedImage)}
        isDemoMode={workflow.isDemoMode}
        onToggleDemoMode={workflow.handleToggleDemoMode}
        isBackendOnline={workflow.isBackendOnline}
      />

      {/* 2. DEMO / LIVE API STATUS BANNER */}
      <div className="w-full bg-white border-b border-[#E5E7EB]/80 px-4 py-2">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {workflow.isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium text-[11px]">
                <Info className="w-3 h-3 text-amber-700" />
                Demo Mode Active (Using local sample models)
              </span>
            ) : workflow.isBackendOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-medium text-[11px]">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Connected to FastAPI backend (http://localhost:8000)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-medium text-[11px]">
                <Info className="w-3 h-3 text-rose-700" />
                FastAPI is not running. Click &quot;Demo Mode&quot; to test with local sample images.
              </span>
            )}

            <span className="text-[#4B5563] hidden md:inline">
              Drag the center slider to inspect layout preservation against AI render.
            </span>
          </div>

          <button
            type="button"
            onClick={workflow.handleToggleDemoMode}
            className="text-[11px] font-semibold text-[#0F6B63] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Switch to {workflow.isDemoMode ? 'Live API' : 'Demo Mode'}
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* SUCCESS NOTIFICATION */}
        {workflow.successNotice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{workflow.successNotice}</span>
            </div>
            <button
              type="button"
              onClick={workflow.clearSuccess}
              className="text-emerald-700 hover:text-emerald-900 font-bold px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* ERROR FEEDBACK */}
        {workflow.error && (
          <ErrorMessage
            title={workflow.error.title}
            message={workflow.error.message}
            onRetry={workflow.error.action ? workflow.handleRetry : null}
            onDismiss={workflow.clearError}
          />
        )}

        {/* 4. VISUAL CENTERPIECE: BEFORE/AFTER COMPARISON SLIDER */}
        <section aria-label="Interior Design Comparison">
          <BeforeAfterSlider
            originalImage={workflow.originalImage}
            generatedImage={workflow.currentGeneratedImage}
            sliderPosition={workflow.comparisonPosition}
            onSliderChange={workflow.setComparisonPosition}
            roomLabel={`${workflow.roomType} (${workflow.style})`}
          />
        </section>

        {/* 5. REFINE YOUR DESIGN (Immediately below comparison frame) */}
        <section aria-label="Refine Your Design">
          <RefinementPanel
            instruction={workflow.refinementInstruction}
            onInstructionChange={workflow.setRefinementInstruction}
            onSubmit={workflow.handleRefine}
            isRefining={workflow.isRefining}
            disabled={!workflow.currentGeneratedImage}
          />
        </section>

        {/* 6. ROOM PARAMETERS & INITIAL GENERATION CONTROLS */}
        <section aria-label="Design Controls and Presets">
          <DesignControls
            roomType={workflow.roomType}
            onRoomTypeChange={workflow.setRoomType}
            style={workflow.style}
            onStyleChange={workflow.setStyle}
            preserveLayout={workflow.preserveLayout}
            onPreserveLayoutChange={workflow.setPreserveLayout}
            prompt={workflow.designPrompt}
            onPromptChange={workflow.setDesignPrompt}
            onGenerate={workflow.handleGenerate}
            isGenerating={workflow.isGenerating}
            onImageUpload={workflow.setOriginalImage}
          />
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-[#E5E7EB] bg-white py-4 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#4B5563]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1F2937]">SketchSpace AI</span>
            <span>• Hackathon Edition</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Palette: Deep Teal (#0F6B63) & Soft Aqua (#4FD1C5)</span>
            <span>• Layout-Aware AI Inference</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
