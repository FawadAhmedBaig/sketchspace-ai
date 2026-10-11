/**
 * DesignAndRefineScreen.jsx
 * 
 * Primary screen container matching the Stitch SketchSpace AI screen design.
 * Assembles:
 * - AppHeader with brand, room/style badges, and reset action
 * - Title area with "Design & Refine" heading and "Layout Preserved" status pill
 * - Design Selectors Bar (Room Type & Interior Style — display only)
 * - Before / After Comparison Slider with presets & actions
 * - Refinement Dock with input, suggestion chips, progress states
 * - Animated Toast Notification
 */

import React from 'react';
import AppHeader from '../layout/AppHeader';
import DesignControls from './DesignControls';
import BeforeAfterSlider from '../comparison/BeforeAfterSlider';
import RefinementPanel from '../refinement/RefinementPanel';
import { useDesignWorkflow } from '../../hooks/useDesignWorkflow';
import { CheckCircle2 } from 'lucide-react';

export default function DesignAndRefineScreen({
  initialOriginalImage,
  initialGeneratedImage,
  initialRoomType,
  initialStyle,
  onBackToWorkspace,
  onNewProject,
}) {
  const workflow = useDesignWorkflow({
    originalImage: initialOriginalImage,
    generatedImage: initialGeneratedImage,
    roomType: initialRoomType,
    style: initialStyle,
  });

  return (
    <div className="bg-cream min-h-screen text-charcoal flex flex-col antialiased selection:bg-aqua-soft selection:text-teal font-sans">
      {/* 1. Top Navigation Bar */}
      <AppHeader
        roomType={workflow.roomType}
        style={workflow.style}
        onBackToWorkspace={onBackToWorkspace}
        onNewProject={onNewProject}
        onResetSplit={() => {
          workflow.setComparisonPosition(50);
          workflow.triggerToast('Comparison reset to 50% split.');
        }}
      />

      {/* 2. Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 flex flex-col gap-6">
        {/* Screen Title Area */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-charcoal-border/50 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
              Design &amp; Refine
            </h1>
            <p className="text-sm sm:text-base text-charcoal-muted mt-0.5">
              Compare your design and make it your own.
            </p>
          </div>

          {/* Compact Quick Info Pill */}
          <div className="self-start sm:self-auto flex items-center gap-2 text-xs text-charcoal-muted bg-white px-3 py-1.5 rounded-lg border border-charcoal-border shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-charcoal">Layout Preserved</span>
            <span className="text-charcoal-border">•</span>
            <span className="text-teal font-semibold">1/1 Active Concept</span>
          </div>
        </div>

        {/* Design Selectors Bar (Display Only) */}
        <DesignControls
          roomType={workflow.roomType}
          style={workflow.style}
        />

        {/* MAIN FEATURE: Before / After Comparison */}
        <BeforeAfterSlider
          originalImage={workflow.originalImage}
          generatedImage={workflow.currentGeneratedImage}
          sliderPosition={workflow.comparisonPosition}
          onSliderChange={workflow.setComparisonPosition}
          onDownload={workflow.handleDownload}
          onSave={workflow.handleSaveDesign}
          isDownloading={workflow.isDownloading}
        />

        {/* MAIN FEATURE: Text-based AI Refinement Dock */}
        <RefinementPanel
          instruction={workflow.refinementInstruction}
          onInstructionChange={workflow.setRefinementInstruction}
          onSubmit={workflow.handleRefine}
          isRefining={workflow.isRefining}
          refineProgress={workflow.refineProgress}
          refineStepLabel={workflow.refineStepLabel}
          error={workflow.error}
          successNotice={workflow.successNotice}
          onRetry={workflow.handleRetry}
          roomType={workflow.roomType}
          style={workflow.style}
          onTriggerToast={workflow.triggerToast}
        />
      </main>

      {/* Floating Notification Toast */}
      <div
        id="toast"
        aria-live="polite"
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none ${
          workflow.showToast
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="bg-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-aqua shrink-0" />
          <span>{workflow.toastMessage || 'Design updated successfully!'}</span>
        </div>
      </div>
    </div>
  );
}
