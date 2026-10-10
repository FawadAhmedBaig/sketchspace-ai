import { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Home } from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import DesignSelectors from './DesignSelectors';
import RefinementDock from './RefinementDock';

/**
 * DesignAndRefineScreen — Standalone screen matching the Stitch project:
 * "SketchSpace AI Design Refine" (Screen ID: 356a12453a434a9f9cb3f8cda64543e5).
 *
 * Keeps all original canvas / workspace code untouched while providing
 * the full Before/After Comparison Studio & Refinement Dock workflow.
 */
export default function DesignAndRefineScreen({
  onBack,
  initialBeforeImage = '/stitch/original-sample.png',
  initialAfterImage = '/stitch/ai-generated-sample.png',
  initialRoomType = 'Living Room',
  initialStyle = 'Modern',
  onGenerateRefinement,
}) {
  const [roomType, setRoomType] = useState(initialRoomType);
  const [style, setStyle] = useState(initialStyle);
  const [beforeImage, setBeforeImage] = useState(initialBeforeImage);
  const [afterImage, setAfterImage] = useState(initialAfterImage);
  const [refineStatus, setRefineStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRefine = async (prompt) => {
    setRefineStatus('loading');
    setErrorMessage('');

    if (onGenerateRefinement) {
      try {
        const result = await onGenerateRefinement({ roomType, style, prompt });
        if (result?.imageDataUrl) {
          setAfterImage(result.imageDataUrl);
        }
        setRefineStatus('success');
        showToast('Design updated successfully!');
      } catch (err) {
        setRefineStatus('error');
        setErrorMessage(err.message || 'Refinement failed.');
      }
    } else {
      // Standalone simulation mode matching Stitch mock behavior
      setTimeout(() => {
        setRefineStatus('success');
        showToast('Design updated successfully with prompt!');
      }, 1800);
    }
  };

  return (
    <div className="bg-cream min-h-screen text-charcoal flex flex-col antialiased selection:bg-aqua-soft selection:text-teal">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-charcoal-border/70 px-4 sm:px-6 py-3 transition-shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Back Action */}
          <div className="flex items-center gap-3 sm:gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-charcoal-muted hover:text-teal hover:bg-teal-surface/60 transition-colors"
                title="Back to workspace"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-teal/20">
                <Home className="w-4 h-4 text-aqua" />
              </div>
              <div className="leading-tight">
                <span className="text-sm sm:text-base font-bold tracking-tight text-charcoal">
                  SketchSpace<span className="text-teal ml-0.5">AI</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Room Context Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 bg-cream px-2.5 py-1 rounded-full border border-charcoal-border/80 text-xs font-medium text-charcoal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span>{roomType}</span>
            </div>
            <div className="flex items-center gap-1 bg-aqua-soft px-2.5 py-1 rounded-full text-xs font-semibold text-teal border border-aqua/30">
              <Sparkles className="w-3 h-3 text-teal" />
              <span>{style} Style</span>
            </div>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 pl-2 border-l border-charcoal-border">
              <div className="w-8 h-8 rounded-full bg-teal-surface border border-teal/20 text-teal flex items-center justify-center font-bold text-xs ring-2 ring-white">
                SC
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
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
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-charcoal">Layout Preserved</span>
            <span className="text-charcoal-border">•</span>
            <span className="text-teal font-semibold">1/1 Active Concept</span>
          </div>
        </div>

        {/* Room & Style Selectors */}
        <DesignSelectors
          roomType={roomType}
          style={style}
          onRoomTypeChange={setRoomType}
          onStyleChange={setStyle}
          disabled={refineStatus === 'loading'}
        />

        {/* Before / After Comparison */}
        <BeforeAfterSlider
          beforeImage={beforeImage}
          afterImage={afterImage}
          beforeLabel="Original Room"
          afterLabel="AI Generated"
          onNotify={showToast}
        />

        {/* AI Refinement Dock */}
        <RefinementDock
          roomType={roomType}
          style={style}
          status={refineStatus}
          isLoading={refineStatus === 'loading'}
          errorMessage={errorMessage}
          onRefine={handleRefine}
          onRetry={() => handleRefine('Add warm ambient cove lighting')}
          onNotify={showToast}
        />
      </main>

      {/* Notification Toast */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <div className="bg-charcoal text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/10">
          <Check className="w-4 h-4 text-aqua" />
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}
